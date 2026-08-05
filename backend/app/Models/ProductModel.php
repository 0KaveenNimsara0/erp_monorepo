<?php

namespace App\Models;

use CodeIgniter\Model;

class ProductModel extends Model
{
    protected $table            = 'products';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = [
        'sku',
        'name',
        'category',
        'price',
        'cost_price',
        'stock_quantity',
        'reorder_level'
    ];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Validation
    protected $validationRules = [
        'sku'            => 'required|is_unique[products.sku,id,{id}]',
        'name'           => 'required|min_length[2]',
        'category'       => 'required',
        'price'          => 'required|numeric',
        'cost_price'     => 'required|numeric',
        'stock_quantity' => 'required|integer',
        'reorder_level'  => 'required|integer'
    ];
}
