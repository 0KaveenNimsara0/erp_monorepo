<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use CodeIgniter\I18n\Time;

class ProductSeeder extends Seeder
{
    public function run()
    {
        // Disable foreign key checks while truncating
        $this->db->query('SET FOREIGN_KEY_CHECKS=0');
        $this->db->table('products')->truncate();
        $this->db->table('categories')->truncate();
        $this->db->query('SET FOREIGN_KEY_CHECKS=1');

        $categories = [
            ['name' => 'Bakery'],
            ['name' => 'Hardware'],
            ['name' => 'Apparel'],
            ['name' => 'Groceries'],
        ];

        $this->db->table('categories')->insertBatch($categories);

        // Get inserted categories mapped by name
        $dbCats = $this->db->table('categories')->get()->getResultArray();
        $catMap = [];
        foreach ($dbCats as $c) {
            $catMap[$c['name']] = $c['id'];
        }

        $data = [
            [
                'sku' => 'BAK-BRD-01',
                'name' => 'Artisan Sourdough Bread',
                'category_id' => $catMap['Bakery'],
                'price' => 6.50,
                'cost_price' => 2.00,
                'stock_quantity' => 40,
                'reorder_level' => 10,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'BAK-CRS-02',
                'name' => 'Butter Croissant (6-Pack)',
                'category_id' => $catMap['Bakery'],
                'price' => 8.99,
                'cost_price' => 3.50,
                'stock_quantity' => 25,
                'reorder_level' => 5,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'HDW-DRL-01',
                'name' => 'Cordless Power Drill 20V',
                'category_id' => $catMap['Hardware'],
                'price' => 89.99,
                'cost_price' => 45.00,
                'stock_quantity' => 15,
                'reorder_level' => 5,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'HDW-HMR-02',
                'name' => 'Steel Claw Hammer',
                'category_id' => $catMap['Hardware'],
                'price' => 14.50,
                'cost_price' => 6.00,
                'stock_quantity' => 60,
                'reorder_level' => 20,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'CLO-TSH-01',
                'name' => 'Organic Cotton T-Shirt (Black)',
                'category_id' => $catMap['Apparel'],
                'price' => 19.99,
                'cost_price' => 7.50,
                'stock_quantity' => 100,
                'reorder_level' => 30,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'CLO-JNS-02',
                'name' => 'Classic Blue Denim Jeans',
                'category_id' => $catMap['Apparel'],
                'price' => 49.99,
                'cost_price' => 22.00,
                'stock_quantity' => 45,
                'reorder_level' => 15,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'GRO-CFE-01',
                'name' => 'Premium Arabica Coffee Beans 1kg',
                'category_id' => $catMap['Groceries'],
                'price' => 24.50,
                'cost_price' => 12.00,
                'stock_quantity' => 80,
                'reorder_level' => 25,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'GRO-OIV-02',
                'name' => 'Extra Virgin Olive Oil 500ml',
                'category_id' => $catMap['Groceries'],
                'price' => 12.99,
                'cost_price' => 5.50,
                'stock_quantity' => 55,
                'reorder_level' => 20,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
        ];

        $this->db->table('products')->insertBatch($data);
    }
}
