<?php

namespace App\Models;

use CodeIgniter\Model;

class UserModel extends Model
{
    protected $table            = 'users';
    protected $primaryKey       = 'id';
    protected $useAutoIncrement = true;
    protected $returnType       = 'array';
    protected $useSoftDeletes   = false;
    protected $protectFields    = true;
    protected $allowedFields    = ['username', 'password_hash', 'pin_hash', 'role', 'status'];

    // Dates
    protected $useTimestamps = true;
    protected $dateFormat    = 'datetime';
    protected $createdField  = 'created_at';
    protected $updatedField  = 'updated_at';

    // Validation
    protected $validationRules = [
        'id'       => 'permit_empty|integer',
        'username' => 'required|alpha_numeric_space|min_length[3]|is_unique[users.username,id,{id}]',
        'role'     => 'required|in_list[admin,manager,staff]',
        'status'   => 'required|in_list[active,inactive]'
    ];
}
