<?php

namespace App\Services;

use App\DTOs\Auth\LoginRequestDTO;
use App\Exceptions\AuthException;
use App\Libraries\AuditLogger;
use App\Repositories\UserRepository;
use CodeIgniter\HTTP\RequestInterface;
use Firebase\JWT\JWT;

class AuthService
{
    private UserRepository $userRepo;

    public function __construct()
    {
        $this->userRepo = new UserRepository();
    }

    /**
     * Authenticate a user and return a signed JWT token.
     *
     * @param LoginRequestDTO $dto
     * @param RequestInterface $request Used for audit IP logging
     * @return array{token: string, user: array<string, mixed>}
     * @throws AuthException
     */
    public function login(LoginRequestDTO $dto, RequestInterface $request): array
    {
        $user = $dto->loginType === 'password'
            ? $this->authenticateByPassword($dto, $request)
            : $this->authenticateByPin($dto, $request);

        if (($user['status'] ?? 'active') === 'inactive') {
            AuditLogger::log('LOGIN_FAILED', 'auth', $user['id'], ['reason' => 'Account inactive'], null, $request, null);
            throw new AuthException('This account has been deactivated. Please contact an administrator.');
        }

        $token = $this->generateToken($user);

        AuditLogger::log('LOGIN_SUCCESS', 'auth', $user['id'], null, ['role' => $user['role']], $request, $user['id']);

        return [
            'token' => $token,
            'user'  => [
                'id'       => $user['id'],
                'username' => $user['username'],
                'role'     => $user['role'],
            ],
        ];
    }

    /** @return array<string, mixed> @throws AuthException */
    private function authenticateByPassword(LoginRequestDTO $dto, RequestInterface $request): array
    {
        $user = $this->userRepo->findByUsername($dto->username);

        if (!$user || !password_verify($dto->password, $user['password_hash'])) {
            AuditLogger::log('LOGIN_FAILED', 'auth', $user['id'] ?? null, ['reason' => 'Invalid credentials', 'username' => $dto->username], null, $request, null);
            throw new AuthException('Invalid username or password.');
        }

        if (!in_array($user['role'], ['admin', 'manager'], true)) {
            AuditLogger::log('LOGIN_FAILED', 'auth', $user['id'], ['reason' => 'Role not allowed for password login'], null, $request, null);
            throw new AuthException('This role is not allowed to use password login.');
        }

        return $user;
    }

    /** @return array<string, mixed> @throws AuthException */
    private function authenticateByPin(LoginRequestDTO $dto, RequestInterface $request): array
    {
        $staffMembers = $this->userRepo->findAllStaff();

        foreach ($staffMembers as $staff) {
            if (password_verify($dto->pin, $staff['pin_hash'])) {
                return $staff;
            }
        }

        AuditLogger::log('LOGIN_FAILED', 'auth', null, ['reason' => 'Invalid PIN'], null, $request, null);
        throw new AuthException('Invalid staff PIN. Please try again.');
    }

    /** @param array<string, mixed> $user */
    private function generateToken(array $user): string
    {
        $key        = getenv('jwt.secret');
        $expiration = (int)(getenv('jwt.expiration') ?: 86400);

        $payload = [
            'iat'  => time(),
            'exp'  => time() + $expiration,
            'uid'  => $user['id'],
            'role' => $user['role'],
        ];

        return JWT::encode($payload, $key, 'HS256');
    }
}
