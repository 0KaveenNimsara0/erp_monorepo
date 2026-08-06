<?php

namespace App\DTOs\Sale;

use App\Exceptions\ValidationException;

class CreateSaleDTO
{
    /** @var SaleItemDTO[] */
    public readonly array  $items;
    public readonly string $paymentMethod;
    public readonly float  $subtotal;
    public readonly float  $tax;
    public readonly float  $totalAmount;
    public readonly int    $userId;

    /** @param SaleItemDTO[] $items */
    private function __construct(
        array  $items,
        string $paymentMethod,
        float  $subtotal,
        float  $tax,
        float  $totalAmount,
        int    $userId
    ) {
        $this->items         = $items;
        $this->paymentMethod = $paymentMethod;
        $this->subtotal      = $subtotal;
        $this->tax           = $tax;
        $this->totalAmount   = $totalAmount;
        $this->userId        = $userId;
    }

    /**
     * @param array<string, mixed> $data
     * @throws ValidationException
     */
    public static function fromArray(array $data, int $userId): self
    {
        if (empty($data['items']) || !is_array($data['items'])) {
            throw new ValidationException(['items' => 'At least one sale item is required.']);
        }

        $allowedPayments = ['cash', 'card', 'bank_transfer'];
        $paymentMethod   = $data['payment_method'] ?? 'cash';
        if (!in_array($paymentMethod, $allowedPayments, true)) {
            throw new ValidationException(['payment_method' => 'Invalid payment method.']);
        }

        $items = [];
        foreach ($data['items'] as $raw) {
            $items[] = new SaleItemDTO(
                productId:   (int)($raw['id'] ?? 0),
                productName: (string)($raw['name'] ?? ''),
                quantity:    (int)($raw['qty'] ?? 1),
                unitPrice:   (float)($raw['price'] ?? 0),
            );
        }

        return new self(
            $items,
            $paymentMethod,
            (float)($data['subtotal'] ?? 0),
            (float)($data['tax'] ?? 0),
            (float)($data['total_amount'] ?? 0),
            $userId
        );
    }
}
