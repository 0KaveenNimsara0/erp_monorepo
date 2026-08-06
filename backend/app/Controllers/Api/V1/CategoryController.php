<?php

namespace App\Controllers\Api\V1;

use App\Exceptions\ForbiddenException;
use App\Exceptions\NotFoundException;
use App\Exceptions\ValidationException;
use App\Services\CategoryService;
use CodeIgniter\RESTful\ResourceController;

class CategoryController extends ResourceController
{
    protected $format = 'json';
    private CategoryService $categoryService;

    public function __construct()
    {
        $this->categoryService = new CategoryService();
    }

    /** GET /api/v1/categories */
    public function index()
    {
        return $this->respond([
            'status' => 200,
            'data'   => $this->categoryService->listAll(),
        ]);
    }

    /** POST /api/v1/categories */
    public function create()
    {
        try {
            $data     = $this->request->getJSON(true) ?? [];
            $category = $this->categoryService->create($data, $this->request->user, $this->request);
            return $this->respondCreated(['status' => 201, 'data' => $category]);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        } catch (ValidationException $e) {
            return $this->failValidationErrors($e->getErrors());
        }
    }

    /** DELETE /api/v1/categories/{id} */
    public function delete($id = null)
    {
        try {
            $this->categoryService->delete((int)$id, $this->request->user, $this->request);
            return $this->respondDeleted(['status' => 200, 'message' => 'Category deleted.']);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        } catch (NotFoundException $e) {
            return $this->failNotFound($e->getMessage());
        }
    }
}
