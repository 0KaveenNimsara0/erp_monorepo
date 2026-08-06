<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use CodeIgniter\I18n\Time;

class UserSeeder extends Seeder
{
    public function run()
    {
        $this->db->table('users')->truncate();

        $users = [
            [
                'username'      => 'admin',
                'password_hash' => password_hash('admin123', PASSWORD_DEFAULT),
                'pin_hash'      => null,
                'role'          => 'admin',
                'status'        => 'active',
                'created_at'    => Time::now(),
                'updated_at'    => Time::now(),
            ],
            [
                'username'      => 'manager',
                'password_hash' => password_hash('manager123', PASSWORD_DEFAULT),
                'pin_hash'      => null,
                'role'          => 'manager',
                'status'        => 'active',
                'created_at'    => Time::now(),
                'updated_at'    => Time::now(),
            ],
            [
                'username'      => 'staff1',
                'password_hash' => null,
                'pin_hash'      => password_hash('123456', PASSWORD_DEFAULT),
                'role'          => 'staff',
                'status'        => 'active',
                'created_at'    => Time::now(),
                'updated_at'    => Time::now(),
            ],
        ];

        $this->db->table('users')->insertBatch($users);
    }
}
