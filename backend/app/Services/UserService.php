<?php

namespace App\Services;

use App\DTOs\User\CreateUserDTO;
use App\DTOs\User\UpdateUserDTO;
use App\Exceptions\ForbiddenException;
use App\Exceptions\NotFoundException;
use App\Exceptions\ValidationException;
use App\Libraries\AuditLogger;
use App\Repositories\UserRepository;
use CodeIgniter\HTTP\RequestInterface;

class UserService
{
    private UserRepository $userRepo;

    public function __construct()
    {
        $this->userRepo = new UserRepository();
    }

    /**
     * @return array<int, array<string, mixed>>
     * @throws ForbiddenException
     */
    public function listAll(object $currentUser): array
    {
        if (!in_array($currentUser->role, ['admin', 'manager'], true)) {
            throw new ForbiddenException('You do not have permission to view users.');
        }

        return $this->userRepo->findAllPublic();
    }

    /**
     * @return array<string, mixed>
     * @throws ForbiddenException|ValidationException
     */
    public function create(array $rawData, object $currentUser, RequestInterface $request): array
    {
        if (!in_array($currentUser->role, ['admin', 'manager'], true)) {
            throw new ForbiddenException('You do not have permission to create users.');
        }

        $requestedRole = $rawData['role'] ?? 'staff';

        if ($currentUser->role === 'manager' && $requestedRole !== 'staff') {
            throw new ForbiddenException('Managers can only create staff users.');
        }

        $dto = CreateUserDTO::fromArray($rawData);
        $id  = $this->userRepo->create($dto->toArray());

        if (!$id) {
            throw new ValidationException($this->userRepo->getErrors());
        }

        $created = $this->userRepo->findPublicById($id);
        AuditLogger::log('CREATE', 'users', $id, null, $created, $request, $currentUser->uid);

        return $created;
    }

    /**
     * @return array<string, mixed>
     * @throws ForbiddenException|NotFoundException
     */
    public function update(int $id, array $rawData, object $currentUser, RequestInterface $request): array
    {
        if (!in_array($currentUser->role, ['admin', 'manager'], true)) {
            throw new ForbiddenException('You do not have permission to edit users.');
        }

        $target = $this->userRepo->findById($id);
        if (!$target) {
            throw new NotFoundException('User not found.');
        }

        if ($currentUser->role === 'manager' && $target['role'] !== 'staff') {
            throw new ForbiddenException('Managers can only edit staff users.');
        }

        $requestedRole = $rawData['role'] ?? null;
        if ($currentUser->role === 'manager' && $requestedRole !== null && $requestedRole !== 'staff') {
            throw new ForbiddenException('Managers cannot elevate user roles.');
        }

        $dto = UpdateUserDTO::fromArray($rawData);
        $this->userRepo->update($id, $dto->toArray());

        $updated = $this->userRepo->findPublicById($id);
        AuditLogger::log('UPDATE', 'users', $id, $target, $updated, $request, $currentUser->uid);

        return $updated;
    }

    /**
     * @throws ForbiddenException|NotFoundException
     */
    public function delete(int $id, object $currentUser, RequestInterface $request): void
    {
        if ($currentUser->role !== 'admin') {
            throw new ForbiddenException('Only Administrators can delete users.');
        }

        $target = $this->userRepo->findById($id);
        if (!$target) {
            throw new NotFoundException('User not found.');
        }

        $this->userRepo->delete($id);
        AuditLogger::log('DELETE', 'users', $id, $target, null, $request, $currentUser->uid);
    }
}
