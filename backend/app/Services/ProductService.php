<?php

namespace App\Services;

use App\DTOs\Product\CreateProductDTO;
use App\DTOs\Product\UpdateProductDTO;
use App\Exceptions\ForbiddenException;
use App\Exceptions\NotFoundException;
use App\Exceptions\ValidationException;
use App\Libraries\AuditLogger;
use App\Repositories\ProductRepository;
use CodeIgniter\HTTP\RequestInterface;

class ProductService
{
    private ProductRepository $productRepo;

    public function __construct()
    {
        $this->productRepo = new ProductRepository();
    }

    /** @return array<int, array<string, mixed>> */
    public function listAll(): array
    {
        return $this->productRepo->findAllWithCategory();
    }

    /** @return array<string, mixed> @throws NotFoundException */
    public function getById(int $id): array
    {
        $product = $this->productRepo->findByIdWithCategory($id);

        if (!$product) {
            throw new NotFoundException("Product with ID {$id} not found.");
        }

        return $product;
    }

    /**
     * @return array<string, mixed>
     * @throws ForbiddenException|ValidationException
     */
    public function create(array $rawData, object $currentUser, RequestInterface $request): array
    {
        if (!in_array($currentUser->role, ['admin', 'manager'], true)) {
            throw new ForbiddenException('Only Managers and Administrators can add products.');
        }

        $dto = CreateProductDTO::fromArray($rawData);
        $id  = $this->productRepo->create($dto->toArray());

        if (!$id) {
            throw new ValidationException($this->productRepo->getErrors());
        }

        $created = $this->productRepo->findById($id);
        AuditLogger::log('CREATE', 'products', $id, null, $created, $request, $currentUser->uid);

        return $created;
    }

    /**
     * @return array<string, mixed>
     * @throws ForbiddenException|NotFoundException
     */
    public function update(int $id, array $rawData, object $currentUser, RequestInterface $request): array
    {
        if (!in_array($currentUser->role, ['admin', 'manager'], true)) {
            throw new ForbiddenException('Only Managers and Administrators can update products.');
        }

        $before = $this->productRepo->findById($id);
        if (!$before) {
            throw new NotFoundException("Product with ID {$id} not found.");
        }

        $dto = UpdateProductDTO::fromArray($rawData);
        $updateData = $dto->toArray();
        
        // Merge with existing data so CI4 validation doesn't fail on missing required fields
        $fullUpdateData = array_merge($before, $updateData);

        $success = $this->productRepo->update($id, $fullUpdateData);
        if (!$success) {
            throw new ValidationException($this->productRepo->getErrors());
        }

        $after = $this->productRepo->findById($id);
        AuditLogger::log('UPDATE', 'products', $id, $before, $after, $request, $currentUser->uid);

        return $after;
    }

    /**
     * @throws ForbiddenException|NotFoundException
     */
    public function delete(int $id, object $currentUser, RequestInterface $request): void
    {
        if ($currentUser->role !== 'admin') {
            throw new ForbiddenException('Only Administrators can delete products.');
        }

        $product = $this->productRepo->findById($id);
        if (!$product) {
            throw new NotFoundException("Product with ID {$id} not found.");
        }

        $this->productRepo->delete($id);
        AuditLogger::log('DELETE', 'products', $id, $product, null, $request, $currentUser->uid);
    }
}
