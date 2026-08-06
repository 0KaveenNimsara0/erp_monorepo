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
}
