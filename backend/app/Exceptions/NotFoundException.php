<?php

namespace App\Exceptions;

class NotFoundException extends AppException
{
    public function __construct(string $message = 'Resource not found.', int $code = 404)
    {
        parent::__construct($message, $code);
    }
}
