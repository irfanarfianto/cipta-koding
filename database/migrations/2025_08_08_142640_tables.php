<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        

        // --- 2. create_clients_table.php ---
        Schema::create('clients', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone_number', 20)->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        // --- 3. create_services_table.php ---
        Schema::create('services', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('base_price', 15, 2)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        
        // --- 4. create_tags_table.php ---
        Schema::create('tags', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
        });

        // --- 5. create_testimonials_table.php ---
        Schema::create('testimonials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('client_name');
            $table->string('client_position')->nullable();
            $table->text('content');
            $table->boolean('is_featured')->default(false);
            $table->timestamps();
        });

        // --- 6. create_portfolio_projects_table.php ---
        Schema::create('portfolio_projects', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('project_url')->nullable();
            $table->string('cover_image_url')->nullable();
            $table->date('completed_date')->nullable();
            $table->string('client_name')->nullable();
            $table->timestamps();
        });

        // --- 7. create_posts_table.php ---
        Schema::create('posts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('body');
            $table->string('cover_image_url')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });

        // --- 8. create_orders_table.php ---
        Schema::create('orders', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('order_code', 20)->unique();
            $table->foreignUuid('client_id')->constrained('clients')->onDelete('cascade');
            $table->enum('status', ['Menunggu Konfirmasi', 'Menunggu Pembayaran', 'Sedang Dikerjakan', 'Review', 'Selesai', 'Dibatalkan'])->default('Menunggu Konfirmasi');
            $table->decimal('final_amount', 15, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // --- 9. create_invoices_table.php ---
        Schema::create('invoices', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('invoice_code', 20)->unique();
            $table->foreignUuid('order_id')->constrained('orders')->onDelete('cascade');
            $table->decimal('amount', 15, 2);
            $table->enum('status', ['unpaid', 'paid', 'overdue', 'cancelled'])->default('unpaid');
            $table->date('due_date');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });

        // --- 10. create_order_items_table.php ---
        Schema::create('order_items', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')->constrained('orders')->onDelete('cascade');
            $table->uuidMorphs('item'); // Membuat item_id (UUID) dan item_type (VARCHAR)
            $table->integer('quantity')->default(1);
            $table->decimal('price', 15, 2);
            $table->timestamps();
        });

        // --- 11. create_taggables_table.php ---
        Schema::create('taggables', function (Blueprint $table) {
            $table->foreignUuid('tag_id')->constrained('tags')->onDelete('cascade');
            $table->uuidMorphs('taggable'); // Membuat taggable_id (UUID) dan taggable_type (VARCHAR)
            $table->primary(['tag_id', 'taggable_id', 'taggable_type']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('taggables');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('invoices');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('posts');
        Schema::dropIfExists('portfolio_projects');
        Schema::dropIfExists('testimonials');
        Schema::dropIfExists('tags');
        Schema::dropIfExists('services');
        Schema::dropIfExists('clients');
    }
};
