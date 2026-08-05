<?php

namespace App\Controllers\Api\V1;

use App\Models\SaleModel;
use App\Models\SaleItemModel;
use App\Models\ProductModel;
use CodeIgniter\RESTful\ResourceController;

class Sales extends ResourceController
{
    protected $format = 'json';

    public function index()
    {
        $saleModel = new SaleModel();
        $sales = $saleModel->orderBy('created_at', 'DESC')->findAll();

        return $this->respond([
            'status' => 200,
            'data'   => $sales
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

        $saleData = [
            'invoice_number' => $invoiceNumber,
            'user_id'        => $json['user_id'] ?? 1,
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
