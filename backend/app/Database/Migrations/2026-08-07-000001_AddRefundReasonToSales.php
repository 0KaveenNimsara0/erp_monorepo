<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddRefundReasonToSales extends Migration
{
    public function up()
    {
        $this->forge->addColumn('sales', [
            'refund_reason' => [
                'type' => 'TEXT',
                'null' => true,
                'after' => 'status',
            ],
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('sales', 'refund_reason');
    }
}
