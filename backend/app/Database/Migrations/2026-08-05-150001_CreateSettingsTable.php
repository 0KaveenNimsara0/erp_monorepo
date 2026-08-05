<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateSettingsTable extends Migration
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
            'setting_key' => [
                'type'       => 'VARCHAR',
                'constraint' => '100',
                'unique'     => true,
            ],
            'setting_value' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);
        
        $this->forge->addKey('id', true);
        $this->forge->createTable('settings');

        // Insert default Tax settings
        $db = \Config\Database::connect();
        $builder = $db->table('settings');
        $now = date('Y-m-d H:i:s');
        $builder->insertBatch([
            [
                'setting_key' => 'tax_enabled',
                'setting_value' => '1',
                'updated_at' => $now
            ],
            [
                'setting_key' => 'tax_rate',
                'setting_value' => '8.0',
                'updated_at' => $now
            ]
        ]);
    }

    public function down()
    {
        $this->forge->dropTable('settings');
    }
}
