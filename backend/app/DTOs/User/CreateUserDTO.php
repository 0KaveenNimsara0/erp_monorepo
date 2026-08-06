<?php

namespace App\DTOs\User;

use App\Exceptions\ValidationException;

class CreateUserDTO
{
    public readonly string $username;
    public readonly string $passwordHash;
    public readonly string $pinHash;
    public readonly string $role;
    public readonly string $status;

    private function __construct(
        string $username,
        string $passwordHash,
        string $pinHash,
        string $role,
        string $status
    ) {
        $this->username     = $username;
        $this->passwordHash = $passwordHash;
        $this->pinHash      = $pinHash;
        $this->role         = $role;
        $this->status       = $status;
    }

    /**
     * @param array<string, mixed> $data
     * @throws ValidationException
     */
    public static function fromArray(array $data): self
    {
        $errors = [];

        $username = trim($data['username'] ?? '');
        $password = $data['password'] ?? '';
        $pin      = (string)($data['pin'] ?? '');
        $role     = $data['role'] ?? 'staff';
        $status   = $data['status'] ?? 'active';

        if (empty($username))                                    $errors['username'] = 'Username is required.';
        if (strlen($username) < 3)                               $errors['username'] = 'Username must be at least 3 characters.';
        if (empty($password))                                    $errors['password'] = 'Password is required.';
        if (strlen($pin) !== 6 || !ctype_digit($pin))           $errors['pin']      = 'PIN must be exactly 6 digits.';
        if (!in_array($role, ['admin', 'manager', 'staff']))     $errors['role']     = 'Invalid role.';
        if (!in_array($status, ['active', 'inactive']))          $errors['status']   = 'Invalid status.';

        if (!empty($errors)) {
            throw new ValidationException($errors);
        }

        return new self(
            $username,
            password_hash($password, PASSWORD_DEFAULT),
            password_hash($pin, PASSWORD_DEFAULT),
            $role,
            $status
        );
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'username'      => $this->username,
            'password_hash' => $this->passwordHash,
            'pin_hash'      => $this->pinHash,
            'role'          => $this->role,
            'status'        => $this->status,
        ];
    }
}
