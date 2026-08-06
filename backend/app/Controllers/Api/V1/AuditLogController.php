<?php

namespace App\Controllers\Api\V1;

use App\Exceptions\ForbiddenException;
use App\Services\AuditLogService;
use CodeIgniter\RESTful\ResourceController;

class AuditLogController extends ResourceController
{
    protected $format = 'json';
    private AuditLogService $auditLogService;

    public function __construct()
    {
        $this->auditLogService = new AuditLogService();
    }

    /** GET /api/v1/audit-logs */
    public function index()
    {
        try {
            $logs = $this->auditLogService->listAll($this->request->user);
            return $this->respond(['status' => 200, 'data' => $logs]);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        }
    }
}
