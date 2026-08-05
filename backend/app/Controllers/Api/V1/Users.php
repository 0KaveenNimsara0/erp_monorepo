<?php

namespace App\Controllers\Api\V1;

use CodeIgniter\RESTful\ResourceController;
use App\Models\UserModel;

class Users extends ResourceController
{
    protected $modelName = UserModel::class;
    protected $format    = 'json';

    // Helper to get current user from request (set by AuthFilter)
    private function getCurrentUser()
    {
        return $this->request->user ?? null;
    }

    public function index()
    {
        $user = $this->getCurrentUser();
        if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            return $this->failForbidden('You do not have permission to view users.');
        }

        // Both admin and manager can view all users, but we exclude sensitive hashes
        $users = $this->model->select('id, username, role, status, created_at')->findAll();
        return $this->respond(['status' => 200, 'data' => $users]);
    }

    public function create()
    {
        $currentUser = $this->getCurrentUser();
        if (!$currentUser || !in_array($currentUser->role, ['admin', 'manager'])) {
            return $this->failForbidden('You do not have permission to create users.');
        }

        $json = $this->request->getJSON(true) ?? $this->request->getRawInput();

        // Manager can only create staff
        if ($currentUser->role === 'manager' && isset($json['role']) && $json['role'] !== 'staff') {
            return $this->failForbidden('Managers can only create staff users.');
        }

        // Validate password and pin
        if (empty($json['password']) || empty($json['pin'])) {
            return $this->failValidationErrors('Password and PIN are required for new users.');
        }

        // Hash them
        $json['password_hash'] = password_hash((string)$json['password'], PASSWORD_DEFAULT);
        $json['pin_hash'] = password_hash((string)$json['pin'], PASSWORD_DEFAULT);

        // Default status
        $json['status'] = $json['status'] ?? 'active';

        if ($this->model->insert($json)) {
            $id = $this->model->getInsertID();
            $created = $this->model->select('id, username, role, status, created_at')->find($id);
            return $this->respondCreated([
                'status'   => 201,
                'messages' => ['success' => 'User created successfully'],
                'data'     => $created
            ]);
        }

        return $this->failValidationErrors($this->model->errors());
    }

    public function update($id = null)
    {
        $currentUser = $this->getCurrentUser();
        if (!$currentUser || !in_array($currentUser->role, ['admin', 'manager'])) {
            return $this->failForbidden('You do not have permission to edit users.');
        }

        $targetUser = $this->model->find($id);
        if (!$targetUser) {
            return $this->failNotFound('User not found.');
        }

        // Manager restriction: Can only edit staff
        if ($currentUser->role === 'manager' && $targetUser['role'] !== 'staff') {
            return $this->failForbidden('Managers can only edit staff users.');
        }

        $json = $this->request->getJSON(true) ?? $this->request->getRawInput();
        $json['id'] = $id;

        // If manager tries to change role to something other than staff
        if ($currentUser->role === 'manager' && isset($json['role']) && $json['role'] !== 'staff') {
             return $this->failForbidden('Managers cannot elevate roles.');
        }

        // Handle password/pin updates
        if (!empty($json['password'])) {
            $json['password_hash'] = password_hash((string)$json['password'], PASSWORD_DEFAULT);
        }
        if (!empty($json['pin'])) {
            $json['pin_hash'] = password_hash((string)$json['pin'], PASSWORD_DEFAULT);
        }

        if ($this->model->update($id, $json)) {
            $updated = $this->model->select('id, username, role, status, created_at')->find($id);
            return $this->respond([
                'status'   => 200,
                'messages' => ['success' => 'User updated successfully'],
                'data'     => $updated
            ]);
        }

        return $this->failValidationErrors($this->model->errors());
    }
}
