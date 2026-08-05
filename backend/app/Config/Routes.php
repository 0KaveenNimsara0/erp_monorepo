<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// API V1 Routes
$routes->group('api/v1', static function ($routes) {
    $routes->resource('products', ['controller' => 'Api\V1\Products']);
    $routes->resource('sales', ['controller' => 'Api\V1\Sales']);
});
