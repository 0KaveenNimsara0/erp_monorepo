<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Base exception for all application domain errors.
 */
abstract class AppException extends RuntimeException
{
    public function __construct(string $message, int $code = 0, ?\Throwable $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
