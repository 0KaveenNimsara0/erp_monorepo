<?php

namespace App\Controllers\Api\V1;

use App\Models\ProductModel;
use CodeIgniter\RESTful\ResourceController;
use App\Libraries\AuditLogger;

class Products extends ResourceController
{
    protected $modelName = ProductModel::class;
    protected $format    = 'json';

    // Helper to get current user from request
    private function getCurrentUser()
    {
        return $this->request->user ?? null;
    }

    /**
     * GET /api/v1/products
     * Fetch all products dynamically from MySQL database.
     */
    public function index()
    {
        $products = $this->model
            ->select('products.*, categories.name as category')
            ->join('categories', 'categories.id = products.category_id', 'left')
            ->findAll();

        return $this->respond([
            'status'   => 200,
            'error'    => null,
            'messages' => ['success' => 'Products fetched from MySQL database'],
            'data'     => $products
        ]);
    }

    /**
     * GET /api/v1/products/{id}
     */
    public function show($id = null)
    {
        $product = $this->model
            ->select('products.*, categories.name as category')
            ->join('categories', 'categories.id = products.category_id', 'left')
            ->where('products.id', $id)
            ->first();
            
        if (!$product) {
            return $this->failNotFound("Product with ID {$id} not found.");
        }

        return $this->respond([
            'status' => 200,
            'data'   => $product
        ]);
    }

    /**
     * POST /api/v1/products
     * Create new product directly in MySQL database (Admin & Manager only)
     */
    public function create()
    {
        $user = $this->getCurrentUser();
        if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            return $this->failForbidden('Only Managers and Administrators can add products.');
        }

        $json = $this->request->getJSON(true) ?? $this->request->getPost();

        if (!$json) {
            return $this->fail('No data provided', 400);
        }

        if ($this->model->insert($json)) {
            $insertId = $this->model->getInsertID();
            $created  = $this->model->find($insertId);

            AuditLogger::log('CREATE', 'products', $insertId, null, $created, $this->request, $user->id);

            return $this->respondCreated([
                'status'   => 201,
                'messages' => ['success' => 'Product created in database'],
                'data'     => $created
            ]);
        }

        return $this->failValidationErrors($this->model->errors());
    }

    /**
     * PUT /api/v1/products/{id}
     * Update product details (Admin & Manager only)
     */
    public function update($id = null)
    {
        $user = $this->getCurrentUser();
        if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            return $this->failForbidden('Only Managers and Administrators can update products.');
        }

        $product = $this->model->find($id);
        if (!$product) {
            return $this->failNotFound("Product with ID {$id} not found.");
        }

        $json = $this->request->getJSON(true) ?? $this->request->getRawInput();
        $json['id'] = $id;

        if ($this->model->update($id, $json)) {
            $updated = $this->model->find($id);

            AuditLogger::log('UPDATE', 'products', $id, $product, $updated, $this->request, $user->id);
            return $this->respond([
                'status'   => 200,
                'messages' => ['success' => 'Product updated in database'],
                'data'     => $updated
            ]);
        }

        return $this->failValidationErrors($this->model->errors());
    }

    /**
     * DELETE /api/v1/products/{id}
     */
    public function delete($id = null)
    {
        $user = $this->getCurrentUser();
        if (!$user || $user->role !== 'admin') {
            return $this->failForbidden('Only Administrators can delete products.');
        }

        $product = $this->model->find($id);
        if (!$product) {
            return $this->failNotFound("Product with ID {$id} not found.");
        }

        if ($this->model->delete($id)) {
            AuditLogger::log('DELETE', 'products', $id, $product, null, $this->request, $user->id);
            return $this->respondDeleted([
                'status'   => 200,
                'messages' => ['success' => 'Product deleted from database'],
                'id'       => $id
            ]);
        }

        return $this->fail('Failed to delete product from database', 500);
    }
}
