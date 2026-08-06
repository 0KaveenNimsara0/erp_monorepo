<?php

namespace App\Controllers\Api\V1;

use App\DTOs\Auth\LoginRequestDTO;
use App\Exceptions\AuthException;
use App\Exceptions\ValidationException;
use App\Services\AuthService;
use CodeIgniter\RESTful\ResourceController;

class AuthController extends ResourceController
{
    private AuthService $authService;

    public function __construct()
    {
        $this->authService = new AuthService();
    }

    /**
     * POST /api/auth/login
     */
    public function login()
    {
        try {
            $input = $this->request->getJSON(true) ?? $this->request->getVar() ?? [];
            $dto   = LoginRequestDTO::fromArray((array) $input);
            $result = $this->authService->login($dto, $this->request);

            return $this->respond([
                'message' => 'Login successful',
                'token'   => $result['token'],
                'user'    => $result['user'],
            ]);
        } catch (ValidationException $e) {
            return $this->failValidationErrors($e->getErrors());
        } catch (AuthException $e) {
            return $this->failUnauthorized($e->getMessage());
        }
    }
}
