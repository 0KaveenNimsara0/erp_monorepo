<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateCategoriesTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type'           => 'INT',
                'constraint'     => 11,
                'unsigned'       => true,
                'auto_increment' => true,
            ],
            'name' => [
                'type'       => 'VARCHAR',
                'constraint' => '191',
                'unique'     => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        
        $this->forge->addKey('id', true);
        $this->forge->createTable('categories');

        // Insert default seed data
        $db = \Config\Database::connect();
        $builder = $db->table('categories');
        $defaults = ['Hardware', 'Supplies', 'Electronics', 'Apparel', 'General', 'Groceries', 'Beverages'];
        $batch = [];
        $now = date('Y-m-d H:i:s');
        foreach ($defaults as $cat) {
            $batch[] = [
                'name' => $cat,
                'created_at' => $now,
                'updated_at' => $now
            ];
        }
        $builder->insertBatch($batch);
    }

    public function down()
    {
        $this->forge->dropTable('categories');
    }
}
