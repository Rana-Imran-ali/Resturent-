<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\OrderController;
use App\Http\Controllers\RagChatController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes for Dastarkhwan AI Restaurant Management System
|--------------------------------------------------------------------------
*/

// Public Authentication
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Authenticated User Profile
Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

// Vector Database & RAG Chat Routes
Route::prefix('chat')->group(function () {
    Route::post('/rag', [RagChatController::class, 'ask']);
});
Route::prefix('rag')->group(function () {
    Route::post('/reindex', [RagChatController::class, 'reindex']);
    Route::get('/status', [RagChatController::class, 'status']);
});

// Menu Routes
Route::prefix('menu')->group(function () {
    Route::get('/categories', [MenuController::class, 'categories']);
    Route::get('/', [MenuController::class, 'index']);
    Route::post('/recommendations', [MenuController::class, 'smartRecommend']);
    Route::get('/{id}', [MenuController::class, 'show']);
    Route::post('/', [MenuController::class, 'store']);
    Route::put('/{id}', [MenuController::class, 'update']);
    Route::patch('/{id}/toggle-availability', [MenuController::class, 'toggleAvailability']);
    Route::delete('/{id}', [MenuController::class, 'destroy']);
});

// Order Routes
Route::prefix('orders')->group(function () {
    Route::get('/stats/summary', [OrderController::class, 'stats']);
    Route::get('/track/{orderNumber}', [OrderController::class, 'track']);
    Route::get('/', [OrderController::class, 'index']);
    Route::post('/', [OrderController::class, 'store']);
    Route::get('/{id}', [OrderController::class, 'show']);
    Route::patch('/{id}/status', [OrderController::class, 'updateStatus']);
    Route::post('/{id}/cancel', [OrderController::class, 'cancel']);
});

// Admin Customers Management
Route::prefix('admin')->group(function () {
    Route::get('/customers', [CustomerController::class, 'index']);
    Route::patch('/customers/{id}/risk', [CustomerController::class, 'updateRiskLevel']);
});
