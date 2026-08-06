<?php

namespace App\Services;

use App\Exceptions\ForbiddenException;
use App\Repositories\AuditLogRepository;

class AuditLogService
{
    private AuditLogRepository $auditLogRepo;

    public function __construct()
    {
        $this->auditLogRepo = new AuditLogRepository();
    }

    /**
     * @return array<int, array<string, mixed>>
     * @throws ForbiddenException
     */
    public function listAll(object $currentUser): array
    {
        if ($currentUser->role !== 'admin') {
            throw new ForbiddenException('Only Administrators can view audit logs.');
        }

        return $this->auditLogRepo->findAllWithUser();
    }
}
