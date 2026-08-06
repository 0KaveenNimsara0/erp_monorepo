<?php

namespace App\DTOs\Product;

class UpdateProductDTO
{
    public readonly ?string $sku;
    public readonly ?string $name;
    public readonly ?int    $categoryId;
    public readonly ?float  $price;
    public readonly ?float  $costPrice;
    public readonly ?int    $stockQuantity;
    public readonly ?int    $reorderLevel;

    private function __construct(
        ?string $sku,
        ?string $name,
        ?int    $categoryId,
        ?float  $price,
        ?float  $costPrice,
        ?int    $stockQuantity,
        ?int    $reorderLevel
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
     * Only fields provided in the request will be updated (partial update support).
     *
     * @param array<string, mixed> $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            isset($data['sku'])            ? trim($data['sku'])       : null,
            isset($data['name'])           ? trim($data['name'])      : null,
            isset($data['category_id'])    ? (int)$data['category_id']  : null,
            isset($data['price'])          ? (float)$data['price']    : null,
            isset($data['cost_price'])     ? (float)$data['cost_price'] : null,
            isset($data['stock_quantity']) ? (int)$data['stock_quantity'] : null,
            isset($data['reorder_level'])  ? (int)$data['reorder_level']  : null
        );
    }

    /** Returns only non-null fields for partial DB update. @return array<string, mixed> */
    public function toArray(): array
    {
        $fields = [
            'sku'            => $this->sku,
            'name'           => $this->name,
            'category_id'    => $this->categoryId,
            'price'          => $this->price,
            'cost_price'     => $this->costPrice,
            'stock_quantity' => $this->stockQuantity,
            'reorder_level'  => $this->reorderLevel,
        ];

        return array_filter($fields, fn($v) => $v !== null);
    }
}
