<?php

namespace App\DTOs\Auth;

use App\Exceptions\ValidationException;

class LoginRequestDTO
{
    public readonly string $loginType;
    public readonly ?string $username;
    public readonly ?string $password;
    public readonly ?string $pin;

    private function __construct(
        string $loginType,
        ?string $username,
        ?string $password,
        ?string $pin
    ) {
        $this->loginType = $loginType;
        $this->username  = $username;
        $this->password  = $password;
        $this->pin       = $pin;
    }

    /**
     * Build and validate a LoginRequestDTO from raw request data.
     *
     * @param array<string, mixed> $data
     * @throws ValidationException
     */
    public static function fromArray(array $data): self
    {
        $loginType = $data['loginType'] ?? null;

        if (!in_array($loginType, ['password', 'pin'], true)) {
            throw new ValidationException(['loginType' => 'loginType must be "password" or "pin".']);
        }

        if ($loginType === 'password') {
            $username = trim($data['username'] ?? '');
            $password = $data['password'] ?? '';

            if (empty($username) || empty($password)) {
                throw new ValidationException(['credentials' => 'Username and password are required.']);
            }

            return new self($loginType, $username, $password, null);
        }

        // PIN login
        $pin = $data['pin'] ?? '';
        if (strlen((string)$pin) !== 6 || !ctype_digit((string)$pin)) {
            throw new ValidationException(['pin' => 'A 6-digit numeric PIN is required.']);
        }

        return new self($loginType, null, null, (string)$pin);
    }
}
