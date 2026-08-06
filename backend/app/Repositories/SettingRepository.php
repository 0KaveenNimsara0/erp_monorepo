<?php

namespace App\Repositories;

use App\Models\SettingModel;

class SettingRepository
{
    private SettingModel $model;

    public function __construct()
    {
        $this->model = new SettingModel();
    }

    public function getValue(string $key): ?string
    {
        $row = $this->model->where('setting_key', $key)->first();
        return $row ? $row['setting_value'] : null;
    }

    public function setValue(string $key, string $value): void
    {
        $existing = $this->model->where('setting_key', $key)->first();

        if ($existing) {
            $this->model->update($existing['id'], ['setting_value' => $value]);
        } else {
            $this->model->insert(['setting_key' => $key, 'setting_value' => $value]);
        }
    }
}
