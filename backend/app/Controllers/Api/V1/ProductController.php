<?php

namespace App\Controllers\Api\V1;

use App\Exceptions\AppException;
use App\Exceptions\ForbiddenException;
use App\Exceptions\NotFoundException;
use App\Exceptions\ValidationException;
use App\Services\ProductService;
use CodeIgniter\RESTful\ResourceController;

class ProductController extends ResourceController
{
    protected $format = 'json';
    private ProductService $productService;

    public function __construct()
    {
        $this->productService = new ProductService();
    }

    /** GET /api/v1/products */
    public function index()
    {
        return $this->respond([
            'status' => 200,
            'data'   => $this->productService->listAll(),
        ]);
    }

    /** GET /api/v1/products/{id} */
    public function show($id = null)
    {
        try {
            $product = $this->productService->getById((int)$id);
            return $this->respond(['status' => 200, 'data' => $product]);
        } catch (NotFoundException $e) {
            return $this->failNotFound($e->getMessage());
        }
    }

    /** POST /api/v1/products */
    public function create()
    {
        try {
            $input   = $this->request->getJSON(true) ?? $this->request->getVar() ?? [];
            $product = $this->productService->create((array)$input, $this->request->user, $this->request);
            return $this->respondCreated(['status' => 201, 'data' => $product]);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        } catch (ValidationException $e) {
            return $this->failValidationErrors($e->getErrors());
        }
    }

    /** PUT /api/v1/products/{id} */
    public function update($id = null)
    {
        try {
            $input   = $this->request->getJSON(true) ?? $this->request->getVar() ?? [];
            $product = $this->productService->update((int)$id, (array)$input, $this->request->user, $this->request);
            return $this->respond(['status' => 200, 'data' => $product]);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        } catch (NotFoundException $e) {
            return $this->failNotFound($e->getMessage());
        }
    }

    /** DELETE /api/v1/products/{id} */
    public function delete($id = null)
    {
        try {
            $this->productService->delete((int)$id, $this->request->user, $this->request);
            return $this->respondDeleted(['status' => 200, 'message' => 'Product deleted.']);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        } catch (NotFoundException $e) {
            return $this->failNotFound($e->getMessage());
        }
    }
}
