<?php

namespace App\Controllers\Api\V1;

use App\Exceptions\ForbiddenException;
use App\Exceptions\ValidationException;
use App\Services\SaleService;
use CodeIgniter\RESTful\ResourceController;

class SaleController extends ResourceController
{
    protected $format = 'json';
    private SaleService $saleService;

    public function __construct()
    {
        $this->saleService = new SaleService();
    }

    /** GET /api/v1/sales */
    public function index()
    {
        return $this->respond([
            'status' => 200,
            'data'   => $this->saleService->listAll($this->request->user),
        ]);
    }

    /** GET /api/v1/sales/summary */
    public function summary()
    {
        try {
            $data = $this->saleService->getSummary($this->request->user);
            return $this->respond(['status' => 200, 'data' => $data]);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        }
    }

    /** GET /api/v1/sales/report */
    public function report()
    {
        try {
            $days = $this->request->getVar('days') ?? 30;
            $data = $this->saleService->getReport($this->request->user, $days);
            return $this->respond(['status' => 200, 'data' => $data]);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        }
    }

    /** POST /api/v1/sales */
    public function create()
    {
        try {
            $data   = $this->request->getJSON(true) ?? [];
            $result = $this->saleService->processSale($data, $this->request->user, $this->request);
            return $this->respondCreated(['status' => 201, 'data' => $result]);
        } catch (ValidationException $e) {
            return $this->failValidationErrors($e->getErrors());
        }
    }
}
