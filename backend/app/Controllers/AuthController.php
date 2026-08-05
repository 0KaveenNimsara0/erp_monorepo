<?php

namespace App\Controllers;

use App\Models\UserModel;
use CodeIgniter\RESTful\ResourceController;
use Firebase\JWT\JWT;
use App\Libraries\AuditLogger;

class AuthController extends ResourceController
{
    public function login()
    {
        $rules = [
            'loginType' => 'required|in_list[password,pin]'
        ];

        if (!$this->validate($rules)) {
            return $this->failValidationErrors($this->validator->getErrors());
        }

        $loginType = $this->request->getVar('loginType');
        $userModel = new UserModel();

        if ($loginType === 'password') {
            // Admin or Manager login
            $username = $this->request->getVar('username');
            $password = $this->request->getVar('password');

            if (empty($username) || empty($password)) {
                return $this->failValidationErrors('Username and password are required.');
            }

            $user = $userModel->where('username', $username)->first();

            if (!$user || !password_verify($password, $user['password_hash'])) {
                AuditLogger::log('LOGIN_FAILED', 'auth', $user ? $user['id'] : null, ['reason' => 'Invalid username or password', 'username' => $username], null, $this->request, null);
                return $this->failUnauthorized('Invalid username or password.');
            }

            if (!in_array($user['role'], ['admin', 'manager'])) {
                 AuditLogger::log('LOGIN_FAILED', 'auth', $user['id'], ['reason' => 'Invalid role for password login', 'role' => $user['role']], null, $this->request, null);
                 return $this->failUnauthorized('Invalid role for password login.');
            }

        } else {
            // Staff login via PIN
            $pin = $this->request->getVar('pin');

            if (empty($pin) || strlen($pin) !== 6) {
                return $this->failValidationErrors('A 6-digit PIN is required.');
            }

            $staffMembers = $userModel->where('role', 'staff')->findAll();
            $user = null;

            foreach ($staffMembers as $staff) {
                if (password_verify($pin, $staff['pin_hash'])) {
                    $user = $staff;
                    break;
                }
            }

            if (!$user) {
                AuditLogger::log('LOGIN_FAILED', 'auth', null, ['reason' => 'Invalid PIN'], null, $this->request, null);
                return $this->failUnauthorized('Invalid PIN.');
            }
        }

        if (isset($user['status']) && $user['status'] === 'inactive') {
            AuditLogger::log('LOGIN_FAILED', 'auth', $user['id'], ['reason' => 'Account inactive'], null, $this->request, null);
            return $this->failUnauthorized('This account has been deactivated. Please contact an administrator.');
        }

        // Generate JWT
        $key = getenv('jwt.secret');
        $expiration = getenv('jwt.expiration') ?: 86400;

        $payload = [
            'iat'  => time(),
            'exp'  => time() + $expiration,
            'uid'  => $user['id'],
            'role' => $user['role']
        ];

        $token = JWT::encode($payload, $key, 'HS256');

        AuditLogger::log('LOGIN_SUCCESS', 'auth', $user['id'], null, ['role' => $user['role']], $this->request, $user['id']);

        return $this->respond([
            'message' => 'Login successful',
            'token'   => $token,
            'user'    => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'role'     => $user['role']
            ]
        ]);
    }
}
