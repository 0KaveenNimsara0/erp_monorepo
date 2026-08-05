<?php

namespace App\Controllers\Api\V1;

use App\Models\SaleModel;
use App\Models\SaleItemModel;
use App\Models\ProductModel;
use CodeIgniter\RESTful\ResourceController;
use App\Libraries\AuditLogger;

class Sales extends ResourceController
{
    protected $format = 'json';

    // Helper to get current user from request
    private function getCurrentUser()
    {
        return $this->request->user ?? null;
    }

    public function index()
    {
        $user = $this->getCurrentUser();
        if (!$user) {
            return $this->failUnauthorized('Authentication required');
        }

        $saleModel = new SaleModel();
        
        $saleModel->select('sales.*, users.username as cashier_name')
                  ->join('users', 'users.id = sales.user_id', 'left')
                  ->orderBy('sales.created_at', 'DESC');

        // RBAC: Staff can only see their own sales
        if ($user->role === 'staff') {
            $saleModel->where('sales.user_id', $user->uid);
        }

        $sales = $saleModel->findAll(500); // Limit to 500 for performance

        // Fetch items for each sale (optional, but good for detailed views)
        $saleItemModel = new SaleItemModel();
        foreach ($sales as &$sale) {
            $sale['items'] = $saleItemModel->where('sale_id', $sale['id'])->findAll();
        }

        return $this->respond([
            'status' => 200,
            'data'   => $sales
        ]);
    }

    public function summary()
    {
        $user = $this->getCurrentUser();
        // Staff cannot view global summary
        if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            return $this->failForbidden('You do not have permission to view sales summaries.');
        }

        $saleModel = new SaleModel();

        $today = date('Y-m-d');
        
        // Today's Revenue
        $todayRevenue = $saleModel->selectSum('total_amount')
            ->where('DATE(created_at)', $today)
            ->where('status', 'completed')
            ->first()['total_amount'] ?? 0;

        // Today's Orders
        $todayOrders = $saleModel->where('DATE(created_at)', $today)
            ->where('status', 'completed')
            ->countAllResults();

        // Total Revenue (Lifetime)
        $totalRevenue = $saleModel->selectSum('total_amount')
            ->where('status', 'completed')
            ->first()['total_amount'] ?? 0;
            
        // Total Orders (Lifetime)
        $totalOrders = $saleModel->where('status', 'completed')->countAllResults();

        return $this->respond([
            'status' => 200,
            'data' => [
                'today_revenue' => (float)$todayRevenue,
                'today_orders'  => $todayOrders,
                'total_revenue' => (float)$totalRevenue,
                'total_orders'  => $totalOrders,
                'average_order_value' => $totalOrders > 0 ? (float)($totalRevenue / $totalOrders) : 0
            ]
        ]);
    }

    public function report()
    {
        $user = $this->getCurrentUser();
        // ONLY admin can view deep reports
        if (!$user || $user->role !== 'admin') {
            return $this->failForbidden('Only Administrators can view deep sales reports.');
        }

        $days = $this->request->getVar('days') ?? 30;
        $saleModel = new SaleModel();

        $query = $saleModel->select('DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(id) as orders')
            ->where('status', 'completed')
            ->groupBy('DATE(created_at)')
            ->orderBy('DATE(created_at)', 'ASC');

        if ($days !== 'all') {
            $dateLimit = date('Y-m-d', strtotime("-{$days} days"));
            $query->where('DATE(created_at) >=', $dateLimit);
        }

        $reportData = $query->findAll();

        return $this->respond([
            'status' => 200,
            'data' => $reportData
        ]);
    }

    public function create()
    {
        $json = $this->request->getJSON(true);

        if (!$json || empty($json['items'])) {
            return $this->fail('Invalid transaction data or empty cart', 400);
        }

        $saleModel = new SaleModel();
        $saleItemModel = new SaleItemModel();
        $productModel = new ProductModel();

        $invoiceNumber = 'INV-' . date('Ymd') . '-' . strtoupper(substr(uniqid(), -4));
        
        $currentUser = $this->getCurrentUser();
        $userId = $currentUser ? $currentUser->uid : ($json['user_id'] ?? 1);

        $saleData = [
            'invoice_number' => $invoiceNumber,
            'user_id'        => $userId,
            'subtotal'       => $json['subtotal'] ?? 0.00,
            'tax'            => $json['tax'] ?? 0.00,
            'total_amount'   => $json['total_amount'] ?? 0.00,
            'payment_method' => $json['payment_method'] ?? 'cash',
            'status'         => 'completed'
        ];

        $saleId = $saleModel->insert($saleData);

        if (!$saleId) {
            return $this->fail('Failed to process sale record', 500);
        }

        foreach ($json['items'] as $item) {
            $saleItemModel->insert([
                'sale_id'      => $saleId,
                'product_id'   => $item['id'],
                'product_name' => $item['name'],
                'quantity'     => $item['qty'],
                'unit_price'   => $item['price'],
                'subtotal'     => $item['price'] * $item['qty']
            ]);

            // Decrement inventory stock quantity dynamically
            $product = $productModel->find($item['id']);
            if ($product) {
                $newStock = max(0, $product['stock_quantity'] - $item['qty']);
                $productModel->update($item['id'], ['stock_quantity' => $newStock]);
            }
        }
        
        // Audit log
        AuditLogger::log('CREATE', 'sales', $saleId, null, $saleData, $this->request, $userId);

        return $this->respondCreated([
            'status'   => 201,
            'messages' => ['success' => 'Sale processed successfully'],
            'data'     => [
                'sale_id'        => $saleId,
                'invoice_number' => $invoiceNumber,
                'total_amount'   => $saleData['total_amount']
            ]
        ]);
    }
}
