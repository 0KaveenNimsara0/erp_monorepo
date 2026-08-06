<?php

namespace App\Controllers\Api\V1;

use App\Exceptions\ForbiddenException;
use App\Exceptions\ValidationException;
use App\Services\SettingService;
use CodeIgniter\RESTful\ResourceController;

class SettingController extends ResourceController
{
    protected $format = 'json';
    private SettingService $settingService;

    public function __construct()
    {
        $this->settingService = new SettingService();
    }

    /** GET /api/v1/settings/tax */
    public function getTax()
    {
        try {
            $data = $this->settingService->getTaxSettings($this->request->user);
            return $this->respond(['status' => 200, 'data' => $data]);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        }
    }

    /** PUT /api/v1/settings/tax */
    public function updateTax()
    {
        try {
            $data = $this->request->getJSON(true) ?? [];
            $this->settingService->updateTaxSettings($data, $this->request->user, $this->request);
            return $this->respond(['status' => 200, 'message' => 'Tax settings updated.']);
        } catch (ForbiddenException $e) {
            return $this->failForbidden($e->getMessage());
        } catch (ValidationException $e) {
            return $this->failValidationErrors($e->getErrors());
        }
    }
}
