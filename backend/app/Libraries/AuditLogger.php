<?php

namespace App\Libraries;

use App\Models\AuditLogModel;
use CodeIgniter\HTTP\RequestInterface;

class AuditLogger
{
    /**
     * Log an action to the audit trail.
     *
     * @param string $action       e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN_SUCCESS'
     * @param string $entity       e.g., 'products', 'users', 'auth'
     * @param int|null $entityId   ID of the affected record, if applicable
     * @param array|null $old      Array of original values
     * @param array|null $new      Array of new/updated values
     * @param RequestInterface|null $request The current request for IP tracking
     * @param int|null $userId     The ID of the user performing the action
     */
    public static function log(
        string $action,
        string $entity,
        ?int $entityId = null,
        ?array $old = null,
        ?array $new = null,
        ?RequestInterface $request = null,
        ?int $userId = null
    ) {
        $auditModel = new AuditLogModel();

        // Safely extract IP
        $ip = null;
        if ($request) {
            $ip = $request->getIPAddress();
        }

        $auditModel->insert([
            'user_id'    => $userId,
            'action'     => strtoupper($action),
            'entity'     => $entity,
            'entity_id'  => $entityId,
            'old_values' => $old ? json_encode($old) : null,
            'new_values' => $new ? json_encode($new) : null,
            'ip_address' => $ip
        ]);
    }
}
