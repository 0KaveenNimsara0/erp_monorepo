<?php

namespace App\Controllers\Api\V1;

use App\Models\ProductModel;
use CodeIgniter\RESTful\ResourceController;

class Products extends ResourceController
{
    protected $modelName = ProductModel::class;
    protected $format    = 'json';

    /**
     * GET /api/v1/products
     * Fetch all products dynamically from MySQL database.
     */
    public function index()
    {
        $products = $this->model->findAll();

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
        $product = $this->model->find($id);
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
     * Create new product directly in MySQL database
     */
    public function create()
    {
        $json = $this->request->getJSON(true) ?? $this->request->getPost();

        if (!$json) {
            return $this->fail('No data provided', 400);
        }

        if ($this->model->insert($json)) {
            $insertId = $this->model->getInsertID();
            $created  = $this->model->find($insertId);

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
     */
    public function update($id = null)
    {
        $product = $this->model->find($id);
        if (!$product) {
            return $this->failNotFound("Product with ID {$id} not found.");
        }

        $json = $this->request->getJSON(true) ?? $this->request->getRawInput();

        if ($this->model->update($id, $json)) {
            $updated = $this->model->find($id);
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
        $product = $this->model->find($id);
        if (!$product) {
            return $this->failNotFound("Product with ID {$id} not found.");
        }

        if ($this->model->delete($id)) {
            return $this->respondDeleted([
                'status'   => 200,
                'messages' => ['success' => 'Product deleted from database'],
                'id'       => $id
            ]);
        }

        return $this->fail('Failed to delete product from database', 500);
    }
}
