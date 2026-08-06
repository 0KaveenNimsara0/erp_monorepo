<?php

namespace App\Repositories;

use App\Models\AuditLogModel;

class AuditLogRepository
{
    private AuditLogModel $model;

    public function __construct()
    {
        $this->model = new AuditLogModel();
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function findAllWithUser(int $limit = 500): array
    {
        $logs = $this->model
            ->select('audit_logs.*, users.username')
            ->join('users', 'users.id = audit_logs.user_id', 'left')
            ->orderBy('audit_logs.created_at', 'DESC')
            ->findAll($limit);

        foreach ($logs as &$log) {
            if ($log['old_values']) {
                $log['old_values'] = json_decode($log['old_values'], true);
            }
            if ($log['new_values']) {
                $log['new_values'] = json_decode($log['new_values'], true);
            }
        }

        return $logs;
    }

    /** @param array<string, mixed> $data */
    public function create(array $data): void
    {
        $this->model->insert($data);
    }
}
