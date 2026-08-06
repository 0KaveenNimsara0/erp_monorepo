<?php

namespace App\DTOs\Category;

use App\Exceptions\ValidationException;

class CreateCategoryDTO
{
    public readonly string $name;

    private function __construct(string $name)
    {
        $this->name = $name;
    }

    /**
     * @param array<string, mixed> $data
     * @throws ValidationException
     */
    public static function fromArray(array $data): self
    {
        $name = trim($data['name'] ?? '');

        if (empty($name)) {
            throw new ValidationException(['name' => 'Category name is required.']);
        }

        return new self($name);
    }
}
