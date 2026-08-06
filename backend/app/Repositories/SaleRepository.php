<?php

namespace App\Repositories;

use App\Models\SaleModel;
use App\Models\SaleItemModel;

class SaleRepository
{
    private SaleModel     $saleModel;
    private SaleItemModel $saleItemModel;

    public function __construct()
    {
        $this->saleModel     = new SaleModel();
        $this->saleItemModel = new SaleItemModel();
    }

    /**
     * Fetch all sales. Optionally filter by user_id for staff RBAC.
     * @return array<int, array<string, mixed>>
     */
    public function findAll(?int $userId = null, int $limit = 500): array
    {
        $query = $this->saleModel
            ->select('sales.*, users.username as cashier_name')
            ->join('users', 'users.id = sales.user_id', 'left')
            ->orderBy('sales.created_at', 'DESC');

        if ($userId !== null) {
            $query->where('sales.user_id', $userId);
        }

        $sales = $query->findAll($limit);

        foreach ($sales as &$sale) {
            $sale['items'] = $this->saleItemModel->where('sale_id', $sale['id'])->findAll();
        }

        return $sales;
    }

    /**
     * @param array<string, mixed> $saleData
     * @return int The new sale ID
     */
    public function createSale(array $saleData): int
    {
        $this->saleModel->insert($saleData);
        return $this->saleModel->getInsertID();
    }

    /** @param array<string, mixed> $itemData */
    public function createSaleItem(array $itemData): void
    {
        $this->saleItemModel->insert($itemData);
    }

    /** @return array<string, mixed> */
    public function getSummary(): array
    {
        $today = date('Y-m-d');

        $todayRevenue = (float)($this->saleModel
            ->selectSum('total_amount')
            ->where('DATE(created_at)', $today)
            ->where('status', 'completed')
            ->first()['total_amount'] ?? 0);

        $todayOrders = $this->saleModel->where('DATE(created_at)', $today)
            ->where('status', 'completed')
            ->countAllResults();

        $totalRevenue = (float)($this->saleModel
            ->selectSum('total_amount')
            ->where('status', 'completed')
            ->first()['total_amount'] ?? 0);

        $totalOrders = $this->saleModel->where('status', 'completed')->countAllResults();

        return [
            'today_revenue'       => $todayRevenue,
            'today_orders'        => $todayOrders,
            'total_revenue'       => $totalRevenue,
            'total_orders'        => $totalOrders,
            'average_order_value' => $totalOrders > 0 ? round($totalRevenue / $totalOrders, 2) : 0,
        ];
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function getReport(int|string $days = 30): array
    {
        $query = $this->saleModel
            ->select('DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(id) as orders')
            ->where('status', 'completed')
            ->groupBy('DATE(created_at)')
            ->orderBy('DATE(created_at)', 'ASC');

        if ($days !== 'all') {
            $dateLimit = date('Y-m-d', strtotime("-{$days} days"));
            $query->where('DATE(created_at) >=', $dateLimit);
        }

        return $query->findAll();
    }
}
