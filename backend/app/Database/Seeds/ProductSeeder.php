<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;
use CodeIgniter\I18n\Time;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $data = [
            [
                'sku' => 'TSHIRT-001',
                'name' => 'Premium Cotton T-Shirt',
                'category' => 'Apparel',
                'price' => 25.00,
                'cost_price' => 10.00,
                'stock_quantity' => 150,
                'reorder_level' => 20,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'MUG-002',
                'name' => 'Ceramic Coffee Mug',
                'category' => 'Home & Kitchen',
                'price' => 12.50,
                'cost_price' => 4.00,
                'stock_quantity' => 45,
                'reorder_level' => 50,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'LAPTOP-PRO-15',
                'name' => 'ProBook 15" Laptop',
                'category' => 'Electronics',
                'price' => 1299.99,
                'cost_price' => 950.00,
                'stock_quantity' => 12,
                'reorder_level' => 5,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'MOUSE-WL',
                'name' => 'Wireless Ergonomic Mouse',
                'category' => 'Electronics',
                'price' => 45.00,
                'cost_price' => 15.00,
                'stock_quantity' => 85,
                'reorder_level' => 15,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'NOTEBOOK-A5',
                'name' => 'A5 Leather Notebook',
                'category' => 'Stationery',
                'price' => 18.00,
                'cost_price' => 6.50,
                'stock_quantity' => 200,
                'reorder_level' => 30,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ],
            [
                'sku' => 'HEADPHONE-NC',
                'name' => 'Noise Cancelling Headphones',
                'category' => 'Electronics',
                'price' => 199.99,
                'cost_price' => 110.00,
                'stock_quantity' => 25,
                'reorder_level' => 10,
                'created_at' => Time::now(),
                'updated_at' => Time::now(),
            ]
        ];

        // Using Query Builder
        $this->db->table('products')->insertBatch($data);
    }
}
