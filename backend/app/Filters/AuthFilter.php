<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;
use Config\Services;

class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $header = $request->getHeaderLine('Authorization');
        $token = null;

        // Extract token from the Bearer string
        if (!empty($header)) {
            if (preg_match('/Bearer\s(\S+)/', $header, $matches)) {
                $token = $matches[1];
            }
        }

        if (is_null($token) || empty($token)) {
            $response = Services::response();
            $response->setJSON(['error' => 'Access denied. Token missing.']);
            $response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
            return $response;
        }

        try {
            $key = getenv('jwt.secret');
            $decoded = JWT::decode($token, new Key($key, 'HS256'));
            
            // RBAC Verification
            if ($arguments && is_array($arguments)) {
                $allowedRoles = $arguments;
                if (!in_array($decoded->role, $allowedRoles)) {
                    $response = Services::response();
                    $response->setJSON(['error' => 'Access denied. Insufficient permissions.']);
                    $response->setStatusCode(ResponseInterface::HTTP_FORBIDDEN);
                    return $response;
                }
            }
            
            // Optionally, pass the decoded user data to the request object
            $request->user = $decoded;

        } catch (Exception $ex) {
            $response = Services::response();
            $response->setJSON(['error' => 'Access denied. Invalid token.']);
            $response->setStatusCode(ResponseInterface::HTTP_UNAUTHORIZED);
            return $response;
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Do nothing
    }
}
