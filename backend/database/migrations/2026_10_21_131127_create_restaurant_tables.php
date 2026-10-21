<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add extra fields to users table if not existing
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'role')) {
                $table->string('role')->default('customer')->after('password');
            }
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable()->after('role');
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->text('address')->nullable()->after('phone');
            }
            if (!Schema::hasColumn('users', 'risk_level')) {
                $table->string('risk_level')->default('Low')->after('address');
            }
        });

        // Categories Table
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->text('description')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Menu Items Table
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->string('item_code')->unique()->nullable();
            $table->string('name');
            $table->string('name_ur')->nullable();
            $table->string('category')->index();
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->decimal('price', 10, 2);
            $table->boolean('available')->default(true);
            $table->text('description')->nullable();
            $table->text('ingredients')->nullable();
            $table->string('image')->nullable();
            $table->boolean('is_spicy')->default(false);
            $table->boolean('is_popular')->default(false);
            $table->json('aliases')->nullable();
            $table->integer('stock_quantity')->default(50);
            $table->timestamps();
        });

        // Orders Table
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number')->unique();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->string('customer_email')->nullable();
            $table->text('delivery_address');
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_fee', 10, 2)->default(150);
            $table->decimal('discount', 10, 2)->default(0);
            $table->decimal('grand_total', 10, 2);
            $table->string('status')->default('Pending'); // Pending, Preparing, Ready, Delivered, Cancelled
            $table->string('channel')->default('Web Order'); // Web Order, AI Chatbot, Voice Agent
            $table->string('payment_method')->default('Cash on Delivery (COD)');
            $table->string('payment_status')->default('Pending');
            $table->text('notes')->nullable();
            $table->boolean('risk_flag')->default(false);
            $table->string('risk_reason')->nullable();
            $table->json('transcript')->nullable();
            $table->string('estimated_delivery_time')->nullable();
            $table->timestamps();
        });

        // Order Items Table
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained('orders')->cascadeOnDelete();
            $table->foreignId('menu_item_id')->nullable()->constrained('menu_items')->nullOnDelete();
            $table->string('item_code')->nullable();
            $table->string('name');
            $table->decimal('price', 10, 2);
            $table->integer('quantity')->default(1);
            $table->json('modifiers')->nullable();
            $table->decimal('subtotal', 10, 2);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('menu_items');
        Schema::dropIfExists('categories');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'address', 'risk_level']);
        });
    }
};
