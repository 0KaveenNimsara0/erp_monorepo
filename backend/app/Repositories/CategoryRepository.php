<?php

namespace App\Repositories;

use App\Models\CategoryModel;

class CategoryRepository
{
    private CategoryModel $model;

    public function __construct()
    {
        $this->model = new CategoryModel();
    }

    /** @return array<int, array<string, mixed>> */
    public function findAll(): array
    {
        return $this->model->findAll();
    }

    /** @return array<string, mixed>|null */
    public function findById(int $id): ?array
    {
        return $this->model->find($id) ?: null;
    }

    /** @return array<string, mixed>|null */
    public function findByName(string $name): ?array
    {
        return $this->model->where('name', $name)->first() ?: null;
    }

    public function create(string $name): int
    {
        $this->model->insert(['name' => $name]);
        return $this->model->getInsertID();
    }

    public function delete(int $id): bool
    {
        return (bool)$this->model->delete($id);
    }
}
