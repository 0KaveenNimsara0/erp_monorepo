<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddRefundTracking extends Migration
{
    public function up()
    {
        $this->forge->addColumn('sales', [
            'refunded_amount' => [
                'type'       => 'DECIMAL',
                'constraint' => '10,2',
                'default'    => 0.00,
                'after'      => 'total_amount',
            ],
        ]);

        $this->forge->addColumn('sale_items', [
            'refunded_quantity' => [
                'type'       => 'INT',
                'constraint' => 11,
                'default'    => 0,
                'after'      => 'quantity',
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('sales', 'refunded_amount');
        $this->forge->dropColumn('sale_items', 'refunded_quantity');
    }
}
