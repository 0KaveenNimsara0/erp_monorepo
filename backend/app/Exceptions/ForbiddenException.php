<?php

namespace App\Exceptions;

class ForbiddenException extends AppException
{
    public function __construct(string $message = 'Access denied. Insufficient permissions.', int $code = 403)
    {
        parent::__construct($message, $code);
    }
}
