<?php

namespace App\Controllers\Api\V1;

use CodeIgniter\RESTful\ResourceController;
use App\Models\CategoryModel;
use App\Libraries\AuditLogger;

class Categories extends ResourceController
{
    protected $modelName = CategoryModel::class;
    protected $format    = 'json';

    private function getCurrentUser()
    {
        return $this->request->user ?? null;
    }

    public function index()
    {
        $categories = $this->model->findAll();
        // Return full objects (id and name)
        return $this->respond(['status' => 200, 'data' => $categories]);
    }

    public function create()
    {
        $user = $this->getCurrentUser();
        if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            return $this->failForbidden('Only Managers and Administrators can create categories.');
        }

        $json = $this->request->getJSON(true);
        $name = $json['name'] ?? null;

        if (!$name) {
            return $this->failValidationErrors('Category name is required');
        }

        // Check if exists
        $existing = $this->model->where('name', $name)->first();
        if ($existing) {
            return $this->failResourceExists('Category already exists');
        }

        if ($this->model->insert(['name' => $name])) {
            $id = $this->model->getInsertID();
            $created = $this->model->find($id);
            AuditLogger::log('CREATE', 'categories', $id, null, $created, $this->request, $user->id);
        }
        return $this->respondCreated(['status' => 201, 'message' => 'Category created', 'data' => $name]);
    }

    public function delete($id = null)
    {
        $user = $this->getCurrentUser();
        if (!$user || $user->role !== 'admin') {
            return $this->failForbidden('Only Administrators can delete categories.');
        }

        if (!$id) {
            return $this->failValidationErrors('Category ID is required');
        }

        $category = $this->model->find($id);
        if (!$category) {
            return $this->failNotFound('Category not found');
        }

        if ($this->model->delete($id)) {
            AuditLogger::log('DELETE', 'categories', $id, $category, null, $this->request, $user->id);
        }
        return $this->respondDeleted(['status' => 200, 'message' => 'Category deleted']);
    }
}
