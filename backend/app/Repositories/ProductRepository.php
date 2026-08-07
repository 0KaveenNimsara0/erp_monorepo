<?php

namespace App\Repositories;

use App\Models\ProductModel;

class ProductRepository
{
    private ProductModel $model;

    public function __construct()
    {
        $this->model = new ProductModel();
    }

    /** @return array<int, array<string, mixed>> */
    public function findAllWithCategory(): array
    {
        return $this->model
            ->select('products.*, categories.name as category')
            ->join('categories', 'categories.id = products.category_id', 'left')
            ->findAll();
    }

    /** @return array<string, mixed>|null */
    public function findByIdWithCategory(int $id): ?array
    {
        return $this->model
            ->select('products.*, categories.name as category')
            ->join('categories', 'categories.id = products.category_id', 'left')
            ->where('products.id', $id)
            ->first() ?: null;
    }

    /** @return array<string, mixed>|null */
    public function findById(int $id): ?array
    {
        return $this->model->find($id) ?: null;
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): int
    {
        $this->model->insert($data);
        return $this->model->getInsertID();
    }

    /** @param array<string, mixed> $data */
    public function update(int $id, array $data): bool
    {
        return (bool)$this->model->update($id, $data);
    }

    public function delete(int $id): bool
    {
        return (bool)$this->model->delete($id);
    }

    public function decrementStock(int $productId, int $qty): void
    {
        $product = $this->findById($productId);
        if ($product) {
            $product['stock_quantity'] = max(0, $product['stock_quantity'] - $qty);
            $this->model->update($productId, $product);
        }
    }

    public function incrementStock(int $productId, int $qty): void
    {
        $product = $this->findById($productId);
        if ($product) {
            $product['stock_quantity'] = $product['stock_quantity'] + $qty;
            $this->model->update($productId, $product);
        }
    }

    /** @return array<string, string> */
    public function getErrors(): array
    {
        return $this->model->errors();
    }
}
