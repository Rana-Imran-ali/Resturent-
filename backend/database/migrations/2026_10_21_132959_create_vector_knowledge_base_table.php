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
        Schema::create('vector_knowledge_bases', function (Blueprint $table) {
            $table->id();
            $table->string('document_type')->index(); // 'menu_item', 'faq', 'policy', 'restaurant_info'
            $table->string('reference_id')->nullable()->index();
            $table->string('title');
            $table->text('content');
            $table->json('metadata')->nullable();
            $table->longText('embedding')->nullable(); // JSON float array for vector similarity
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vector_knowledge_bases');
    }
};
