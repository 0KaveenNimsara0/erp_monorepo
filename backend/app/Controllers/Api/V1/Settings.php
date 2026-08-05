<?php

namespace App\Controllers\Api\V1;

use CodeIgniter\RESTful\ResourceController;
use App\Models\SettingModel;
use App\Libraries\AuditLogger;

class Settings extends ResourceController
{
    protected $modelName = SettingModel::class;
    protected $format    = 'json';

    // Helper to get current user from request
    private function getCurrentUser()
    {
        return $this->request->user ?? null;
    }

    public function getTax()
    {
        $user = $this->getCurrentUser();
        if (!$user || $user->role !== 'admin') {
            return $this->failForbidden('Settings access is restricted to Administrators.');
        }

        $enabledSetting = $this->model->where('setting_key', 'tax_enabled')->first();
        $rateSetting = $this->model->where('setting_key', 'tax_rate')->first();

        return $this->respond([
            'status' => 200,
            'data' => [
                'enabled' => $enabledSetting ? (bool)$enabledSetting['setting_value'] : true,
                'rate' => $rateSetting ? (float)$rateSetting['setting_value'] : 8.0
            ]
        ]);
    }

    public function updateTax()
    {
        $user = $this->getCurrentUser();
        if (!$user || $user->role !== 'admin') {
            return $this->failForbidden('Settings access is restricted to Administrators.');
        }

        $json = $this->request->getJSON(true);
        $enabled = $json['enabled'] ?? null;
        $rate = $json['rate'] ?? null;

        if ($enabled !== null) {
            $enabledSetting = $this->model->where('setting_key', 'tax_enabled')->first();
            if ($enabledSetting) {
                $this->model->update($enabledSetting['id'], ['setting_value' => $enabled ? '1' : '0']);
            } else {
                $this->model->insert(['setting_key' => 'tax_enabled', 'setting_value' => $enabled ? '1' : '0']);
            }
        }

        if ($rate !== null) {
            $rateSetting = $this->model->where('setting_key', 'tax_rate')->first();
            if ($rateSetting) {
                $this->model->update($rateSetting['id'], ['setting_value' => (string)$rate]);
            } else {
                $this->model->insert(['setting_key' => 'tax_rate', 'setting_value' => (string)$rate]);
            }
        }

        AuditLogger::log('UPDATE', 'settings', null, null, ['tax_enabled' => $enabled, 'tax_rate' => $rate], $this->request, $user->id);

        return $this->respond(['status' => 200, 'message' => 'Tax settings updated']);
    }
}
