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
    
    // Categories and Settings
    $routes->post('categories', 'Api\V1\Categories::create');
    $routes->get('categories', 'Api\V1\Categories::index');
    $routes->delete('categories/(:segment)', 'Api\V1\Categories::delete/$1');
    
    // Users (RBAC controlled inside controller)
    $routes->resource('users', ['controller' => 'Api\V1\Users']);
    
    $routes->get('settings/tax', 'Api\V1\Settings::getTax');
    $routes->put('settings/tax', 'Api\V1\Settings::updateTax');
});
