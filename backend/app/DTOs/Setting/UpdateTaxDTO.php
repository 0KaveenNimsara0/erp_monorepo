<?php

namespace App\DTOs\Setting;

use App\Exceptions\ValidationException;

class UpdateTaxDTO
{
    public readonly ?bool  $enabled;
    public readonly ?float $rate;

    private function __construct(?bool $enabled, ?float $rate)
    {
        $this->enabled = $enabled;
        $this->rate    = $rate;
    }

    /**
     * @param array<string, mixed> $data
     * @throws ValidationException
     */
    public static function fromArray(array $data): self
    {
        $errors = [];

        $enabled = array_key_exists('enabled', $data) ? (bool)$data['enabled'] : null;
        $rate    = array_key_exists('rate', $data)    ? (float)$data['rate']   : null;

        if ($rate !== null && ($rate < 0 || $rate > 100)) {
            $errors['rate'] = 'Tax rate must be between 0 and 100.';
        }

        if (!empty($errors)) {
            throw new ValidationException($errors);
        }

        return new self($enabled, $rate);
    }
}
