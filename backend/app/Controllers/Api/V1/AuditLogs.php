<?php

namespace App\Controllers\Api\V1;

use CodeIgniter\RESTful\ResourceController;
use App\Models\AuditLogModel;

class AuditLogs extends ResourceController
{
    protected $modelName = AuditLogModel::class;
    protected $format    = 'json';

    // Helper to get current user from request
    private function getCurrentUser()
    {
        return $this->request->user ?? null;
    }

    public function index()
    {
        $user = $this->getCurrentUser();
        if (!$user || $user->role !== 'admin') {
            return $this->failForbidden('Only Administrators can view audit logs.');
        }

        // Get all logs, joining with users table to get the username
        $logs = $this->model
            ->select('audit_logs.*, users.username')
            ->join('users', 'users.id = audit_logs.user_id', 'left')
            ->orderBy('audit_logs.created_at', 'DESC')
            ->findAll(500); // Limit to 500 for performance

        // Decode JSON fields for the frontend
        foreach ($logs as &$log) {
            if ($log['old_values']) {
                $log['old_values'] = json_decode($log['old_values'], true);
            }
            if ($log['new_values']) {
                $log['new_values'] = json_decode($log['new_values'], true);
            }
        }

        return $this->respond([
            'status' => 200,
            'data'   => $logs
        ]);
    }
}
