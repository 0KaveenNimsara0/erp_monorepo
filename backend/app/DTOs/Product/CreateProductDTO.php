<?php

namespace App\DTOs\Product;

use App\Exceptions\ValidationException;

class CreateProductDTO
{
    public readonly string $sku;
    public readonly string $name;
    public readonly int    $categoryId;
    public readonly float  $price;
    public readonly float  $costPrice;
    public readonly int    $stockQuantity;
    public readonly int    $reorderLevel;

    private function __construct(
        string $sku,
        string $name,
        int    $categoryId,
        float  $price,
        float  $costPrice,
        int    $stockQuantity,
        int    $reorderLevel
    ) {
        $this->sku           = $sku;
        $this->name          = $name;
        $this->categoryId    = $categoryId;
        $this->price         = $price;
        $this->costPrice     = $costPrice;
        $this->stockQuantity = $stockQuantity;
        $this->reorderLevel  = $reorderLevel;
    }

    /**
     * @param array<string, mixed> $data
     * @throws ValidationException
     */
    public static function fromArray(array $data): self
    {
        $errors = [];

        $sku           = trim($data['sku'] ?? '');
        $name          = trim($data['name'] ?? '');
        $categoryId    = (int)($data['category_id'] ?? 0);
        $price         = (float)($data['price'] ?? 0);
        $costPrice     = (float)($data['cost_price'] ?? 0);
        $stockQuantity = (int)($data['stock_quantity'] ?? 0);
        $reorderLevel  = (int)($data['reorder_level'] ?? 10);

        if (empty($sku))   $errors['sku']  = 'SKU is required.';
        if (empty($name))  $errors['name'] = 'Product name is required.';
        if ($categoryId <= 0) $errors['category_id'] = 'A valid category is required.';
        if ($price <= 0)   $errors['price'] = 'Price must be greater than 0.';
        if ($costPrice < 0) $errors['cost_price'] = 'Cost price cannot be negative.';
        if ($stockQuantity < 0) $errors['stock_quantity'] = 'Stock quantity cannot be negative.';
        if ($reorderLevel < 0)  $errors['reorder_level']  = 'Reorder level cannot be negative.';

        if (!empty($errors)) {
            throw new ValidationException($errors);
        }

        return new self($sku, $name, $categoryId, $price, $costPrice, $stockQuantity, $reorderLevel);
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'sku'            => $this->sku,
            'name'           => $this->name,
            'category_id'    => $this->categoryId,
            'price'          => $this->price,
            'cost_price'     => $this->costPrice,
            'stock_quantity' => $this->stockQuantity,
            'reorder_level'  => $this->reorderLevel,
        ];
    }
}
