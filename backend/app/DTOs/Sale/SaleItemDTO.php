<?php

namespace App\DTOs\Sale;

class SaleItemDTO
{
    public readonly int    $productId;
    public readonly string $productName;
    public readonly int    $quantity;
    public readonly float  $unitPrice;
    public readonly float  $subtotal;

    public function __construct(
        int    $productId,
        string $productName,
        int    $quantity,
        float  $unitPrice
    ) {
        $this->productId   = $productId;
        $this->productName = $productName;
        $this->quantity    = $quantity;
        $this->unitPrice   = $unitPrice;
        $this->subtotal    = round($unitPrice * $quantity, 2);
    }
}
