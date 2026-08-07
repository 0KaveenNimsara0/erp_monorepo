<?php

namespace App\Services;

use App\DTOs\Sale\CreateSaleDTO;
use App\Exceptions\ForbiddenException;
use App\Libraries\AuditLogger;
use App\Repositories\ProductRepository;
use App\Repositories\SaleRepository;
use CodeIgniter\HTTP\RequestInterface;

class SaleService
{
    private SaleRepository    $saleRepo;
    private ProductRepository $productRepo;

    public function __construct()
    {
        $this->saleRepo    = new SaleRepository();
        $this->productRepo = new ProductRepository();
    }

    /**
     * List sales. Staff see only their own.
     * @return array<int, array<string, mixed>>
     */
    public function listAll(object $currentUser): array
    {
        $userId = $currentUser->role === 'staff' ? $currentUser->uid : null;
        return $this->saleRepo->findAll($userId);
    }

    /**
     * @return array<string, mixed>
     * @throws ForbiddenException
     */
    public function getSummary(object $currentUser): array
    {
        if (!in_array($currentUser->role, ['admin', 'manager'], true)) {
            throw new ForbiddenException('You do not have permission to view sales summaries.');
        }

        return $this->saleRepo->getSummary();
    }

    /**
     * @return array<int, array<string, mixed>>
     * @throws ForbiddenException
     */
    public function getReport(object $currentUser, int|string $days = 30): array
    {
        if ($currentUser->role !== 'admin') {
            throw new ForbiddenException('Only Administrators can view deep sales reports.');
        }

        return $this->saleRepo->getReport($days);
    }

    /**
     * Process a sale transaction — inserts sale record, sale items, and decrements stock.
     *
     * @return array<string, mixed>
     */
    public function processSale(array $rawData, object $currentUser, RequestInterface $request): array
    {
        $dto = CreateSaleDTO::fromArray($rawData, $currentUser->uid);

        $invoiceNumber = 'INV-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));

        $saleId = $this->saleRepo->createSale([
            'invoice_number' => $invoiceNumber,
            'user_id'        => $dto->userId,
            'subtotal'       => $dto->subtotal,
            'tax'            => $dto->tax,
            'total_amount'   => $dto->totalAmount,
            'payment_method' => $dto->paymentMethod,
            'status'         => 'completed',
        ]);

        foreach ($dto->items as $item) {
            $this->saleRepo->createSaleItem([
                'sale_id'      => $saleId,
                'product_id'   => $item->productId,
                'product_name' => $item->productName,
                'quantity'     => $item->quantity,
                'unit_price'   => $item->unitPrice,
                'subtotal'     => $item->subtotal,
            ]);

            // Decrement stock
            $this->productRepo->decrementStock($item->productId, $item->quantity);
        }

        AuditLogger::log('CREATE', 'sales', $saleId, null, ['invoice' => $invoiceNumber, 'total' => $dto->totalAmount], $request, $dto->userId);

        return [
            'sale_id'        => $saleId,
            'invoice_number' => $invoiceNumber,
            'total_amount'   => $dto->totalAmount,
        ];
    }

    /**
     * @return array<string, mixed>
     * @throws ForbiddenException|NotFoundException
     */
    public function getById(int $id, object $currentUser): array
    {
        $sale = $this->saleRepo->findById($id);
        if (!$sale) {
            throw new \App\Exceptions\NotFoundException("Sale with ID {$id} not found.");
        }

        // Staff can only view their own sales
        if ($currentUser->role === 'staff' && $sale['user_id'] != $currentUser->uid) {
            throw new ForbiddenException('You do not have permission to view this sale.');
        }

        return $sale;
    }

    /**
     * @return array<string, mixed>
     * @throws ForbiddenException|NotFoundException|\Exception
     */
    public function refund(int $id, object $currentUser, RequestInterface $request): array
    {
        if (!in_array($currentUser->role, ['admin', 'manager'], true)) {
            throw new ForbiddenException('Only Managers and Administrators can refund sales.');
        }

        $sale = $this->saleRepo->findById($id);
        if (!$sale) {
            throw new \App\Exceptions\NotFoundException("Sale with ID {$id} not found.");
        }

        if ($sale['status'] === 'refunded') {
            throw new \Exception('Sale is already fully refunded.');
        }

        if ($sale['status'] !== 'completed' && $sale['status'] !== 'partially_refunded') {
            throw new \Exception("Cannot refund sale with status: {$sale['status']}");
        }

        // Get payload items
        $payload = $request->getJSON(true);
        if (empty($payload)) {
            $payload = $request->getVar();
            if (is_object($payload)) {
                $payload = json_decode(json_encode($payload), true);
            }
        }
        $payload = (array)($payload ?? []);

        $isPartial = !empty($payload['items']);
        $isFullRefund = !empty($payload['full_refund']);
        
        if (!$isPartial && !$isFullRefund) {
            throw new \Exception('No valid refund items provided. If you want to refund the entire remaining order, specify full_refund=true.');
        }

        $itemsToRefund = $isPartial ? $payload['items'] : [];

        $totalRefundAmountThisTime = 0.0;
        $allRefunded = true;

        $refundRequests = [];
        foreach ($itemsToRefund as $reqItem) {
            $refundRequests[$reqItem['id']] = (int)$reqItem['quantity'];
        }

        foreach ($sale['items'] as &$item) {
            $itemId = (int)$item['id'];
            $qtyBought = (int)$item['quantity'];
            $qtyRefundedSoFar = (int)($item['refunded_quantity'] ?? 0);
            $unitPrice = (float)$item['unit_price'];

            $qtyToRefundNow = 0;

            if ($isPartial) {
                if (isset($refundRequests[$itemId])) {
                    $qtyToRefundNow = $refundRequests[$itemId];
                }
            } else {
                $qtyToRefundNow = $qtyBought - $qtyRefundedSoFar;
            }

            if ($qtyToRefundNow > 0) {
                if ($qtyRefundedSoFar + $qtyToRefundNow > $qtyBought) {
                    throw new \Exception("Cannot refund more than purchased for item ID {$itemId}.");
                }

                // Restore stock
                $this->productRepo->incrementStock((int)$item['product_id'], $qtyToRefundNow);
                
                // Update item refunded quantity
                $newRefundedQty = $qtyRefundedSoFar + $qtyToRefundNow;
                $this->saleRepo->updateSaleItemRefund($itemId, $newRefundedQty);
                $item['refunded_quantity'] = $newRefundedQty;

                // Add to amount
                $totalRefundAmountThisTime += ($qtyToRefundNow * $unitPrice);
            }

            if (($item['refunded_quantity'] ?? 0) < $qtyBought) {
                $allRefunded = false;
            }
        }

        if ($totalRefundAmountThisTime <= 0) {
            throw new \Exception('No valid items were provided to refund.');
        }

        $subtotal = (float)$sale['subtotal'];
        $tax = (float)$sale['tax'];
        $taxRate = $subtotal > 0 ? ($tax / $subtotal) : 0;

        $taxRefundedThisTime = $totalRefundAmountThisTime * $taxRate;
        $totalRefundValueThisTime = $totalRefundAmountThisTime + $taxRefundedThisTime;

        $newTotalRefunded = (float)($sale['refunded_amount'] ?? 0) + $totalRefundValueThisTime;
        $newStatus = $allRefunded ? 'refunded' : 'partially_refunded';

        // Prevent floating point total over-refund
        if ($newTotalRefunded > (float)$sale['total_amount']) {
             $newTotalRefunded = (float)$sale['total_amount'];
        }

        $this->saleRepo->updateSaleRefund($id, $newStatus, $newTotalRefunded);

        $sale['status'] = $newStatus;
        $sale['refunded_amount'] = $newTotalRefunded;
        
        AuditLogger::log('UPDATE', 'sales', $id, ['status' => $sale['status']], ['status' => $newStatus, 'refunded_amount' => $newTotalRefunded], $request, $currentUser->uid);

        return $sale;
    }
}
