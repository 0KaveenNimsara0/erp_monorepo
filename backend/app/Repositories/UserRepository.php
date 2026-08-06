<?php

namespace App\Repositories;

use App\Models\UserModel;

class UserRepository
{
    private UserModel $model;

    public function __construct()
    {
        $this->model = new UserModel();
    }

    /** @return array<int, array<string, mixed>> */
    public function findAllPublic(): array
    {
        return $this->model->select('id, username, role, status, created_at')->findAll();
    }

    /** @return array<string, mixed>|null */
    public function findById(int $id): ?array
    {
        return $this->model->find($id) ?: null;
    }

    /** @return array<string, mixed>|null */
    public function findPublicById(int $id): ?array
    {
        return $this->model->select('id, username, role, status, created_at')->find($id) ?: null;
    }

    /** @return array<string, mixed>|null */
    public function findByUsername(string $username): ?array
    {
        return $this->model->where('username', $username)->first() ?: null;
    }

    /** @return array<int, array<string, mixed>> */
    public function findAllStaff(): array
    {
        return $this->model->where('role', 'staff')->findAll();
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): int
    {
        $this->model->skipValidation(false);
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

    /** @return array<string, string> */
    public function getErrors(): array
    {
        return $this->model->errors();
    }
}
