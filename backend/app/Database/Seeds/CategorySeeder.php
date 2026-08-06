<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use CodeIgniter\I18n\Time;

class CategorySeeder extends Seeder
{
    public function run()
    {
        $categories = [
            ['name' => 'Bakery', 'created_at' => Time::now(), 'updated_at' => Time::now()],
            ['name' => 'Hardware', 'created_at' => Time::now(), 'updated_at' => Time::now()],
            ['name' => 'Apparel', 'created_at' => Time::now(), 'updated_at' => Time::now()],
            ['name' => 'Groceries', 'created_at' => Time::now(), 'updated_at' => Time::now()],
        ];

        foreach ($categories as $cat) {
            $existing = $this->db->table('categories')->where('name', $cat['name'])->get()->getRowArray();
            if (!$existing) {
                $this->db->table('categories')->insert($cat);
            }
        }
    }
}
