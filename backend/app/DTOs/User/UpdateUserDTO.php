<?php

namespace App\DTOs\User;

class UpdateUserDTO
{
    public readonly ?string $username;
    public readonly ?string $passwordHash;
    public readonly ?string $pinHash;
    public readonly ?string $role;
    public readonly ?string $status;

    private function __construct(
        ?string $username,
        ?string $passwordHash,
        ?string $pinHash,
        ?string $role,
        ?string $status
    ) {
        $this->username     = $username;
        $this->passwordHash = $passwordHash;
        $this->pinHash      = $pinHash;
        $this->role         = $role;
        $this->status       = $status;
    }

    /** @param array<string, mixed> $data */
    public static function fromArray(array $data): self
    {
        $passwordHash = null;
        $pinHash      = null;

        // Only hash if field is provided (supports partial updates)
        if (!empty($data['password'])) {
            $passwordHash = password_hash((string)$data['password'], PASSWORD_DEFAULT);
        }
        if (!empty($data['pin'])) {
            $pinHash = password_hash((string)$data['pin'], PASSWORD_DEFAULT);
        }

        return new self(
            isset($data['username']) ? trim($data['username']) : null,
            $passwordHash,
            $pinHash,
            $data['role']   ?? null,
            $data['status'] ?? null
        );
    }

    /** Returns only non-null fields for partial DB update. @return array<string, mixed> */
    public function toArray(): array
    {
        $fields = [
            'username'      => $this->username,
            'password_hash' => $this->passwordHash,
            'pin_hash'      => $this->pinHash,
            'role'          => $this->role,
            'status'        => $this->status,
        ];

        return array_filter($fields, fn($v) => $v !== null);
    }
}
