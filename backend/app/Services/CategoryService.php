<?php

namespace App\Services;

use App\DTOs\Category\CreateCategoryDTO;
use App\Exceptions\ForbiddenException;
use App\Exceptions\NotFoundException;
use App\Libraries\AuditLogger;
use App\Repositories\CategoryRepository;
use CodeIgniter\HTTP\RequestInterface;

class CategoryService
{
    private CategoryRepository $categoryRepo;

    public function __construct()
    {
        $this->categoryRepo = new CategoryRepository();
    }

    /** @return array<int, array<string, mixed>> */
    public function listAll(): array
    {
        return $this->categoryRepo->findAll();
    }

    /**
     * @return array<string, mixed>
     * @throws ForbiddenException
     */
    public function create(array $rawData, object $currentUser, RequestInterface $request): array
    {
        if (!in_array($currentUser->role, ['admin', 'manager'], true)) {
            throw new ForbiddenException('Only Managers and Administrators can create categories.');
        }

        $dto = CreateCategoryDTO::fromArray($rawData);

        $existing = $this->categoryRepo->findByName($dto->name);
        if ($existing) {
            return $existing; // Idempotent — return existing if already present
        }

        $id      = $this->categoryRepo->create($dto->name);
        $created = $this->categoryRepo->findById($id);

        AuditLogger::log('CREATE', 'categories', $id, null, $created, $request, $currentUser->uid);

        return $created;
    }

    /**
     * @throws ForbiddenException|NotFoundException
     */
    public function delete(int $id, object $currentUser, RequestInterface $request): void
    {
        if ($currentUser->role !== 'admin') {
            throw new ForbiddenException('Only Administrators can delete categories.');
        }

        $category = $this->categoryRepo->findById($id);
        if (!$category) {
            throw new NotFoundException('Category not found.');
        }

        $this->categoryRepo->delete($id);
        AuditLogger::log('DELETE', 'categories', $id, $category, null, $request, $currentUser->uid);
    }
}
