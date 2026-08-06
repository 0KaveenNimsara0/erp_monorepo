<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use CodeIgniter\I18n\Time;

class SettingSeeder extends Seeder
{
    public function run()
    {
        $settings = [
            ['setting_key' => 'tax_rate', 'setting_value' => '8.00', 'updated_at' => Time::now()],
            ['setting_key' => 'store_name', 'setting_value' => 'Nexus Retail ERP', 'updated_at' => Time::now()],
            ['setting_key' => 'currency', 'setting_value' => 'LKR', 'updated_at' => Time::now()],
        ];

        foreach ($settings as $setting) {
            $existing = $this->db->table('settings')->where('setting_key', $setting['setting_key'])->get()->getRowArray();
            if (!$existing) {
                $this->db->table('settings')->insert($setting);
            } else {
                $this->db->table('settings')->where('setting_key', $setting['setting_key'])->update(['setting_value' => $setting['setting_value'], 'updated_at' => Time::now()]);
            }
        }
    }
}
