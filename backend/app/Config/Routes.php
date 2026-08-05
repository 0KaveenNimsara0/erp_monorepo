<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Auth Routes
$routes->group('api/auth', static function ($routes) {
    $routes->post('login', 'AuthController::login');
    $routes->options('login', static function() {}); // Handle CORS preflight
});

// Handle CORS preflight for all other API routes
$routes->options('api/v1/(:any)', static function() {});

// API V1 Routes
$routes->group('api/v1', ['filter' => 'auth'], static function ($routes) {
    // For specific RBAC per route, we can define them here instead of using resource() directly, 
    // but for now we apply base auth to all. We can add role checks inside controllers or separate groups.
    $routes->resource('products', ['controller' => 'Api\V1\Products']);
    $routes->resource('sales', ['controller' => 'Api\V1\Sales']);
});
