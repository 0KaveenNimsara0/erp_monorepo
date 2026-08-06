<?php

namespace App\Exceptions;

class ValidationException extends AppException
{
    /** @var array<string, string> */
    private array $errors;

    /**
     * @param array<string, string> $errors Validation error messages keyed by field name
     */
    public function __construct(array $errors, string $message = 'Validation failed.', int $code = 422)
    {
        $this->errors = $errors;
        parent::__construct($message, $code);
    }

    /** @return array<string, string> */
    public function getErrors(): array
    {
        return $this->errors;
    }
}
