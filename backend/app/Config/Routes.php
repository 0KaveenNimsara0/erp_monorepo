<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// Health check
$routes->get('/', static function () {
    return response()->setJSON([
        'status'  => 'online',
        'system'  => 'Nexus ERP REST API',
        'version' => '1.0.0',
    ]);
});

// Global CORS preflight handler
$routes->options('(:any)', static function () {});

// ─── Auth ────────────────────────────────────────────────────────────────────
$routes->group('api/auth', static function ($routes) {
    $routes->post('login', 'Api\V1\AuthController::login');
});

// ─── API V1 (JWT required on all routes) ─────────────────────────────────────
$routes->group('api/v1', ['filter' => 'auth'], static function ($routes) {

    // Products
    $routes->resource('products', ['controller' => 'Api\V1\ProductController']);

    // Sales & Reporting (specific routes must be declared before resource())
    $routes->get('sales/summary', 'Api\V1\SaleController::summary');
    $routes->get('sales/report',  'Api\V1\SaleController::report');
    $routes->post('sales/(:num)/refund', 'Api\V1\SaleController::refund/$1');
    $routes->resource('sales', ['controller' => 'Api\V1\SaleController']);

    // Categories
    $routes->get('categories',              'Api\V1\CategoryController::index');
    $routes->post('categories',             'Api\V1\CategoryController::create');
    $routes->delete('categories/(:segment)', 'Api\V1\CategoryController::delete/$1');

    // Users
    $routes->resource('users', ['controller' => 'Api\V1\UserController']);

    // Settings
    $routes->get('settings/tax', 'Api\V1\SettingController::getTax');
    $routes->put('settings/tax', 'Api\V1\SettingController::updateTax');

    // Audit Logs
    $routes->get('audit-logs', 'Api\V1\AuditLogController::index');
});
