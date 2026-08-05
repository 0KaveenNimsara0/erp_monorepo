<?php

namespace App\Controllers\Api\V1;

use CodeIgniter\RESTful\ResourceController;
use App\Models\SettingModel;

class Settings extends ResourceController
{
    protected $modelName = SettingModel::class;
    protected $format    = 'json';

    public function getTax()
    {
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

        return $this->respond(['status' => 200, 'message' => 'Tax settings updated']);
    }
}
