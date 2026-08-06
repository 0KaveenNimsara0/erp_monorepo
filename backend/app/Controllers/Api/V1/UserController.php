<?php

namespace App\Controllers\Api\V1;

use App\Exceptions\ForbiddenException;
use App\Exceptions\NotFoundException;
use App\Exceptions\ValidationException;
use App\Services\UserService;
use CodeIgniter\RESTful\ResourceController;

class UserController extends ResourceController
{
    protected $format = 'json';
    private UserService $userService;

    public function __construct()
    {
        $this->userService = new UserService();
    }

    /** GET /api/v1/users */
    public function index()
    {
        try {
            $users = $this->userService->listAll($this->request->user);
            return $this->respond(['status' => 200, 'data' => $users]);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        }
    }

    /** POST /api/v1/users */
    public function create()
    {
        try {
            $data = $this->request->getJSON(true) ?? [];
            $user = $this->userService->create($data, $this->request->user, $this->request);
            return $this->respondCreated(['status' => 201, 'data' => $user]);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        } catch (ValidationException $e) {
            return $this->failValidationErrors($e->getErrors());
        }
    }

    /** PUT /api/v1/users/{id} */
    public function update($id = null)
    {
        try {
            $data = $this->request->getJSON(true) ?? [];
            $user = $this->userService->update((int)$id, $data, $this->request->user, $this->request);
            return $this->respond(['status' => 200, 'data' => $user]);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        } catch (NotFoundException $e) {
            return $this->failNotFound($e->getMessage());
        } catch (ValidationException $e) {
            return $this->failValidationErrors($e->getErrors());
        }
    }

    /** DELETE /api/v1/users/{id} */
    public function delete($id = null)
    {
        try {
            $this->userService->delete((int)$id, $this->request->user, $this->request);
            return $this->respondDeleted(['status' => 200, 'message' => 'User deleted successfully.']);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        } catch (NotFoundException $e) {
            return $this->failNotFound($e->getMessage());
        }
    }
}
