<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddCategoryIdToProducts extends Migration
{
    public function up()
    {
        // 1. Add new category_id column
        $this->forge->addColumn('products', [
            'category_id' => [
                'type' => 'INT',
                'constraint' => 11,
                'unsigned' => true,
                'null' => true,
                'after' => 'name'
            ]
        ]);

        // 2. Map existing category strings to category_id
        $this->db->query("
            UPDATE products p
            JOIN categories c ON p.category = c.name
            SET p.category_id = c.id
        ");

        // 3. Drop old category column
        $this->forge->dropColumn('products', 'category');

        // 4. Add foreign key constraint
        $this->db->query("
            ALTER TABLE products
            ADD CONSTRAINT fk_products_category
            FOREIGN KEY (category_id) REFERENCES categories(id)
            ON DELETE SET NULL
            ON UPDATE CASCADE
        ");
    }

    public function down()
    {
        // 1. Add back category column
        $this->forge->addColumn('products', [
            'category' => [
                'type' => 'VARCHAR',
                'constraint' => '100',
                'after' => 'name'
            ]
        ]);

        // 2. Map existing category_ids to category strings
        $this->db->query("
            UPDATE products p
            JOIN categories c ON p.category_id = c.id
            SET p.category = c.name
        ");

        // 3. Drop foreign key constraint
        $this->db->query("ALTER TABLE products DROP FOREIGN KEY fk_products_category");

        // 4. Drop category_id column
        $this->forge->dropColumn('products', 'category_id');
    }
}
