<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        $isPg = DB::getDriverName() === 'pgsql';

        $uuidPk = function (Blueprint $table) use ($isPg) {
            if ($isPg) {
                $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            } else {
                $table->uuid('id')->primary();
            }
        };

        $this->createClientsTable($uuidPk);
        $this->createServicesTable($uuidPk);
        $this->createTagsTable($uuidPk);
        $this->createTestimonialsTable($uuidPk);
        $this->createPortfolioProjectsTable($uuidPk);
        $this->createPostsTable($uuidPk);
        $this->createOrdersTable($uuidPk);
        $this->createInvoicesTable($uuidPk);
        $this->createPaymentsTable($uuidPk);
        $this->createOrderItemsTable($uuidPk);
        $this->createTaggablesTable();
        $this->createOrderStatusHistoriesTable($uuidPk);
        $this->addCheckConstraints($isPg);
    }

    private function createClientsTable($uuidPk)
    {
        Schema::create('clients', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone_number', 20)->nullable()->index();
            $table->text('address')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    private function createServicesTable($uuidPk)
    {
        Schema::create('services', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description');
            $table->decimal('base_price', 19, 0)->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    private function createTagsTable($uuidPk)
    {
        Schema::create('tags', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    private function createTestimonialsTable($uuidPk)
    {
        Schema::create('testimonials', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->string('client_name');
            $table->string('client_position')->nullable();
            $table->foreignUuid('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->text('content');
            $table->boolean('is_featured')->default(false)->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    private function createPortfolioProjectsTable($uuidPk)
    {
        Schema::create('portfolio_projects', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description');
            $table->string('project_url')->nullable();
            $table->string('cover_image_url')->nullable();
            $table->date('completed_date')->nullable()->index();
            $table->foreignUuid('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->string('client_name')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    private function createPostsTable($uuidPk)
    {
        Schema::create('posts', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('excerpt')->nullable();
            $table->longText('body');
            $table->string('cover_image_url')->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft')->index();
            $table->timestampTz('published_at')->nullable()->index();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    private function createOrdersTable($uuidPk)
    {
        Schema::create('orders', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->string('order_code', 20)->unique();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->enum('status', [
                'Menunggu Konfirmasi',
                'Menunggu Pembayaran',
                'Sedang Dikerjakan',
                'Review',
                'Selesai',
                'Dibatalkan'
            ])->default('Menunggu Konfirmasi')->index();
            $table->decimal('final_amount', 19, 0)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    private function createInvoicesTable($uuidPk)
    {
        Schema::create('invoices', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->string('invoice_code', 20)->unique();
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete();
            $table->decimal('amount', 19, 0);
            $table->enum('status', ['unpaid', 'paid', 'overdue', 'cancelled'])->default('unpaid')->index();
            $table->date('due_date')->index();
            $table->timestampTz('paid_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    private function createPaymentsTable($uuidPk)
    {
        Schema::create('payments', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->foreignUuid('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->decimal('amount', 19, 0);
            $table->string('method')->nullable();
            $table->string('reference')->nullable();
            $table->timestampTz('paid_at')->nullable();
            $table->timestamps();
            $table->index(['invoice_id', 'paid_at']);
        });
    }

    private function createOrderItemsTable($uuidPk)
    {
        Schema::create('order_items', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete()->index();
            $table->uuidMorphs('item');
            $table->integer('quantity')->default(1);
            $table->decimal('price', 19, 0);
            $table->timestamps();
        });
    }

    private function createTaggablesTable()
    {
        Schema::create('taggables', function (Blueprint $table) {
            $table->foreignUuid('tag_id')->constrained('tags')->cascadeOnDelete();
            $table->uuidMorphs('taggable');
            $table->primary(['tag_id', 'taggable_id', 'taggable_type']);
        });
    }

    private function createOrderStatusHistoriesTable($uuidPk)
    {
        Schema::create('order_status_histories', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->foreignUuid('order_id')->constrained('orders')->cascadeOnDelete()->index();
            $table->enum('from_status', [
                'Menunggu Konfirmasi',
                'Menunggu Pembayaran',
                'Sedang Dikerjakan',
                'Review',
                'Selesai',
                'Dibatalkan'
            ])->nullable();
            $table->enum('to_status', [
                'Menunggu Konfirmasi',
                'Menunggu Pembayaran',
                'Sedang Dikerjakan',
                'Review',
                'Selesai',
                'Dibatalkan'
            ]);
            $table->foreignUuid('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    private function addCheckConstraints($isPg)
    {
        if ($isPg) {
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_final_amount_nonneg CHECK (final_amount IS NULL OR final_amount >= 0)");
            DB::statement("ALTER TABLE invoices ADD CONSTRAINT invoices_amount_nonneg CHECK (amount >= 0)");
            DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_amount_pos CHECK (amount > 0)");
            DB::statement("ALTER TABLE order_items ADD CONSTRAINT order_items_qty_pos CHECK (quantity >= 1)");
            DB::statement("ALTER TABLE order_items ADD CONSTRAINT order_items_price_nonneg CHECK (price >= 0)");
        } elseif (DB::getDriverName() === 'mysql') {
            try {
                DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_final_amount_nonneg CHECK (final_amount IS NULL OR final_amount >= 0)");
                DB::statement("ALTER TABLE invoices ADD CONSTRAINT invoices_amount_nonneg CHECK (amount >= 0)");
                DB::statement("ALTER TABLE payments ADD CONSTRAINT payments_amount_pos CHECK (amount > 0)");
                DB::statement("ALTER TABLE order_items ADD CONSTRAINT order_items_qty_pos CHECK (quantity >= 1)");
                DB::statement("ALTER TABLE order_items ADD CONSTRAINT order_items_price_nonneg CHECK (price >= 0)");
            } catch (\Throwable $e) {
                // Lewati jika MySQL versi lama
            }
        }
    }

    public function down()
    {
        Schema::dropIfExists('order_status_histories');
        Schema::dropIfExists('taggables');
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('payments');
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
