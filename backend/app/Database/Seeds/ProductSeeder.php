<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run()
    {
        $data = [
            [
                'sku'            => 'SKU-001',
                'name'           => 'Wireless POS Barcode Scanner',
                'category'       => 'Hardware',
                'price'          => 89.99,
                'cost_price'     => 50.00,
                'stock_quantity' => 24,
                'reorder_level'  => 5,
                'created_at'     => date('Y-m-d H:i:s'),
                'updated_at'     => date('Y-m-d H:i:s'),
            ],
            [
                'sku'            => 'SKU-002',
                'name'           => 'Thermal Receipt Paper Roll (50pk)',
                'category'       => 'Supplies',
                'price'          => 29.99,
                'cost_price'     => 12.50,
                'stock_quantity' => 150,
                'reorder_level'  => 20,
                'created_at'     => date('Y-m-d H:i:s'),
                'updated_at'     => date('Y-m-d H:i:s'),
            ],
            [
                'sku'            => 'SKU-003',
                'name'           => 'Heavy Duty Cash Drawer 24V',
                'category'       => 'Hardware',
                'price'          => 119.50,
                'cost_price'     => 70.00,
                'stock_quantity' => 8,
                'reorder_level'  => 3,
                'created_at'     => date('Y-m-d H:i:s'),
                'updated_at'     => date('Y-m-d H:i:s'),
            ],
        ];

        // Using Query Builder
        $this->db->table('products')->insertBatch($data);
    }
}
