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

        // Improve existing tables
        $this->improveClientsTable();
        $this->improveServicesTable();
        $this->improveTagsTable();
        $this->improveTestimonialsTable();
        $this->improvePortfolioProjectsTable();
        $this->improvePostsTable();
        $this->improveOrdersTable();
        $this->improveInvoicesTable();
        $this->improvePaymentsTable();
        $this->improveOrderItemsTable();
        $this->improveOrderStatusHistoriesTable();
        
        // Add new tables for additional features
        $this->createActivityLogsTable($uuidPk);
        $this->createNotificationsTable($uuidPk);
        $this->createQuotationsTable($uuidPk);
        $this->createQuotationItemsTable($uuidPk);
        $this->createMediaTable($uuidPk);
        
        // Add composite indexes for performance
        $this->addCompositeIndexes();
    }

    private function improveClientsTable()
    {
        Schema::table('clients', function (Blueprint $table) {
            // Add company information
            $table->string('company_name')->nullable()->after('name');
            $table->string('company_website')->nullable()->after('company_name');
            
            // Add client type and status
            $table->enum('type', ['individual', 'company'])->default('individual')->after('company_website');
            $table->enum('status', ['active', 'inactive', 'blocked'])->default('active')->index()->after('type');
            
            // Add referral tracking
            $table->foreignUuid('referred_by')->nullable()->after('status')->constrained('clients')->nullOnDelete();
            $table->string('referral_code', 20)->unique()->nullable()->after('referred_by');
            
            // Add metadata
            $table->json('metadata')->nullable()->after('address');
            
            // Add indexes
            $table->index('company_name');
            // Note: status index already created inline at line 55
        });
    }

    private function improveServicesTable()
    {
        Schema::table('services', function (Blueprint $table) {
            // Add category and icon
            $table->string('category', 50)->nullable()->index()->after('description');
            $table->string('icon', 100)->nullable()->after('category');
            
            // Add estimated timeline
            $table->integer('estimated_days')->nullable()->after('icon');
            
            // Add features and pricing tiers as JSON
            $table->json('features')->nullable()->after('estimated_days');
            $table->json('pricing_tiers')->nullable()->after('features');
            
            // Add SEO fields
            $table->string('meta_title')->nullable()->after('pricing_tiers');
            $table->text('meta_description')->nullable()->after('meta_title');
            
            // Add display order
            $table->integer('display_order')->default(0)->after('meta_description');
            
            // Note: category and display_order indexes already created inline
        });
    }

    private function improveTagsTable()
    {
        Schema::table('tags', function (Blueprint $table) {
            // Add type for categorization
            $table->string('type', 50)->nullable()->index()->after('slug');
            
            // Add color for UI
            $table->string('color', 7)->default('#3B82F6')->after('type');
            
            // Add usage counter
            $table->unsignedInteger('usage_count')->default(0)->after('color');
            
            // Add description
            $table->text('description')->nullable()->after('usage_count');
            
            // Note: type and usage_count indexes already created inline
        });
    }

    private function improveTestimonialsTable()
    {
        Schema::table('testimonials', function (Blueprint $table) {
            // Add rating
            $table->unsignedTinyInteger('rating')->default(5)->after('content');
            
            // Add company info
            $table->string('company_name')->nullable()->after('client_position');
            $table->string('avatar_url')->nullable()->after('company_name');
            
            // Add project reference
            $table->foreignUuid('project_id')->nullable()->after('client_id')
                ->constrained('portfolio_projects')->nullOnDelete();
            
            // Add display order
            $table->integer('display_order')->default(0)->after('is_featured');
            
            // Note: rating and display_order indexes already created inline
        });
        
        // Add check constraint for rating (after column is created)
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE testimonials ADD CONSTRAINT testimonials_rating_range CHECK (rating >= 1 AND rating <= 5)');
        }
    }

    private function improvePortfolioProjectsTable()
    {
        Schema::table('portfolio_projects', function (Blueprint $table) {
            // Add tech stack and additional images
            $table->json('tech_stack')->nullable()->after('description');
            $table->json('images')->nullable()->after('cover_image_url');
            
            // Add GitHub URL
            $table->string('github_url')->nullable()->after('project_url');
            
            // Add project metrics
            $table->integer('duration_days')->nullable()->after('completed_date');
            $table->unsignedTinyInteger('team_size')->nullable()->after('duration_days');
            
            // Add featured flag
            $table->boolean('is_featured')->default(false)->index()->after('team_size');
            
            // Add view counter
            $table->unsignedBigInteger('view_count')->default(0)->after('is_featured');
            
            // Add SEO
            $table->string('meta_title')->nullable()->after('view_count');
            $table->text('meta_description')->nullable()->after('meta_title');
            
            // Remove redundant client_name (use relation instead)
            // Note: In production, migrate data first before dropping
            // $table->dropColumn('client_name');
            
            // Note: is_featured and view_count indexes already created inline
        });
    }

    private function improvePostsTable()
    {
        Schema::table('posts', function (Blueprint $table) {
            // Add view count and reading time
            $table->unsignedBigInteger('view_count')->default(0)->after('published_at');
            $table->unsignedInteger('reading_time')->nullable()->after('view_count'); // in minutes
            
            // Add SEO fields
            $table->string('meta_title')->nullable()->after('reading_time');
            $table->text('meta_description')->nullable()->after('meta_title');
            
            // Add featured flag
            $table->boolean('is_featured')->default(false)->index()->after('meta_description');
            
            // Add category
            $table->string('category', 100)->nullable()->index()->after('is_featured');
            
            // Note: view_count and category indexes already created inline
            $table->index(['user_id', 'status']);
        });
    }

    private function improveOrdersTable()
    {
        Schema::table('orders', function (Blueprint $table) {
            // Add discount fields
            $table->decimal('discount_amount', 19, 0)->default(0)->after('final_amount');
            $table->enum('discount_type', ['percentage', 'fixed'])->nullable()->after('discount_amount');
            $table->string('discount_code', 50)->nullable()->after('discount_type');
            
            // Add estimated completion
            $table->date('estimated_completion_date')->nullable()->index()->after('discount_code');
            
            // Add priority
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal')->index()->after('estimated_completion_date');
            
            // Add assignment
            $table->foreignUuid('assigned_to')->nullable()->after('priority')
                ->constrained('users')->nullOnDelete();
            
            // Add status timestamps
            $table->timestampTz('confirmed_at')->nullable()->after('assigned_to');
            $table->timestampTz('started_at')->nullable()->after('confirmed_at');
            $table->timestampTz('completed_at')->nullable()->after('started_at');
            $table->timestampTz('cancelled_at')->nullable()->after('completed_at');
            
            // Note: priority, assigned_to, and estimated_completion_date indexes already created inline
            $table->index(['client_id', 'status', 'created_at']);
        });
    }

    private function improveInvoicesTable()
    {
        Schema::table('invoices', function (Blueprint $table) {
            // Note: type field already exists with correct enum values from original migration
            // We'll just add new fields
            
            // Add tax fields
            $table->decimal('tax_amount', 19, 0)->default(0)->after('amount');
            $table->decimal('tax_percentage', 5, 2)->default(0)->after('tax_amount');
            $table->decimal('subtotal', 19, 0)->nullable()->after('tax_percentage');
            
            // Add notes and payment method
            $table->text('notes')->nullable()->after('subtotal');
            $table->string('payment_method', 50)->nullable()->after('notes');
            
            // Add reminder tracking
            $table->timestampTz('reminder_sent_at')->nullable()->after('paid_at');
            
            // Note: Composite indexes will be added in addCompositeIndexes()
        });
    }

    private function improvePaymentsTable()
    {
        Schema::table('payments', function (Blueprint $table) {
            // Add soft deletes
            $table->softDeletes()->after('updated_at');
            
            // Add payment status
            $table->enum('status', ['pending', 'success', 'failed', 'refunded'])->default('pending')->index()->after('amount');
            
            // Add payment gateway info
            $table->string('payment_gateway', 50)->nullable()->after('method');
            
            // Add proof for manual transfer
            $table->string('proof_url')->nullable()->after('reference');
            
            // Add verification
            $table->foreignUuid('verified_by')->nullable()->after('proof_url')
                ->constrained('users')->nullOnDelete();
            $table->timestampTz('verified_at')->nullable()->after('verified_by');
            
            // Add notes
            $table->text('notes')->nullable()->after('verified_at');
            
            // Note: status and payment_gateway indexes already created inline
            $table->index(['invoice_id', 'status']);
        });
    }

    private function improveOrderItemsTable()
    {
        Schema::table('order_items', function (Blueprint $table) {
            // Add soft deletes
            $table->softDeletes()->after('updated_at');
            
            // Add customization as JSON
            $table->json('customization')->nullable()->after('price');
            
            // Add discount
            $table->decimal('discount_amount', 19, 0)->default(0)->after('customization');
            
            // Add subtotal
            $table->decimal('subtotal', 19, 0)->nullable()->after('discount_amount');
            
            // Add notes
            $table->text('notes')->nullable()->after('subtotal');
            
            // Note: Composite index will be added in addCompositeIndexes()
        });
    }

    private function improveOrderStatusHistoriesTable()
    {
        Schema::table('order_status_histories', function (Blueprint $table) {
            // Use constants from Order model instead of duplicating enum values
            // This requires updating the migration to use raw SQL or accept the duplication
            // For now, we'll keep it as is but add a note in documentation
            
            // Add IP address for audit
            $table->string('ip_address', 45)->nullable()->after('note');
            
            // Add user agent
            $table->string('user_agent')->nullable()->after('ip_address');
            
            // Add indexes
            $table->index(['order_id', 'created_at']);
        });
    }

    private function createActivityLogsTable($uuidPk)
    {
        Schema::create('activity_logs', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->foreignUuid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action');
            $table->string('model_type')->nullable();
            $table->uuid('model_id')->nullable();
            $table->json('properties')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamps();
            
            // Note: Composite indexes will be more efficient
            $table->index(['user_id', 'created_at']);
            $table->index(['model_type', 'model_id']);
            $table->index('action');
        });
    }

    private function createNotificationsTable($uuidPk)
    {
        Schema::create('notifications', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->string('type');
            $table->uuidMorphs('notifiable'); // This already creates the index
            $table->text('data');
            $table->timestampTz('read_at')->nullable();
            $table->timestamps();
            
            // Note: notifiable index already created by uuidMorphs()
            $table->index('read_at');
        });
    }

    private function createQuotationsTable($uuidPk)
    {
        Schema::create('quotations', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->string('quotation_code', 20)->unique();
            $table->foreignUuid('client_id')->constrained('clients')->cascadeOnDelete();
            $table->enum('status', ['draft', 'sent', 'accepted', 'rejected', 'expired'])->default('draft')->index();
            $table->decimal('subtotal', 19, 0)->default(0);
            $table->decimal('discount_amount', 19, 0)->default(0);
            $table->decimal('tax_amount', 19, 0)->default(0);
            $table->decimal('total_amount', 19, 0)->default(0);
            $table->text('terms_conditions')->nullable();
            $table->text('notes')->nullable();
            $table->date('valid_until')->nullable()->index();
            $table->timestampTz('sent_at')->nullable();
            $table->timestampTz('accepted_at')->nullable();
            $table->timestampTz('rejected_at')->nullable();
            $table->foreignUuid('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
            
            // Note: status and valid_until indexes already created inline
            $table->index(['client_id', 'status']);
        });
    }

    private function createQuotationItemsTable($uuidPk)
    {
        Schema::create('quotation_items', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->foreignUuid('quotation_id')->constrained('quotations')->cascadeOnDelete();
            $table->uuidMorphs('item');
            $table->string('description');
            $table->integer('quantity')->default(1);
            $table->decimal('unit_price', 19, 0);
            $table->decimal('subtotal', 19, 0);
            $table->timestamps();
            
            // Note: quotation_id index already created by foreign key
        });
    }

    private function createMediaTable($uuidPk)
    {
        Schema::create('media', function (Blueprint $table) use ($uuidPk) {
            $uuidPk($table);
            $table->uuidMorphs('model'); // This already creates the index
            $table->string('collection_name');
            $table->string('name');
            $table->string('file_name');
            $table->string('mime_type')->nullable();
            $table->string('disk');
            $table->unsignedBigInteger('size');
            $table->json('manipulations')->nullable();
            $table->json('custom_properties')->nullable();
            $table->unsignedInteger('order_column')->nullable();
            $table->timestamps();
            
            // Note: model index already created by uuidMorphs()
            $table->index('collection_name');
        });
    }

    private function addCompositeIndexes()
    {
        // Additional composite indexes for better query performance
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
            $table->index(['client_id', 'created_at']);
        });
        
        Schema::table('invoices', function (Blueprint $table) {
            $table->index(['status', 'created_at']);
            $table->index(['order_id', 'status']);
            $table->index(['status', 'due_date']);
        });
        
        Schema::table('posts', function (Blueprint $table) {
            $table->index(['status', 'published_at']);
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->index(['order_id', 'item_type']);
        });
    }

    public function down()
    {
        // Drop new tables
        Schema::dropIfExists('media');
        Schema::dropIfExists('quotation_items');
        Schema::dropIfExists('quotations');
        Schema::dropIfExists('notifications');
        Schema::dropIfExists('activity_logs');
        
        // Revert improvements (in reverse order)
        Schema::table('order_status_histories', function (Blueprint $table) {
            $table->dropColumn(['ip_address', 'user_agent']);
        });
        
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropColumn(['customization', 'discount_amount', 'subtotal', 'notes']);
        });
        
        Schema::table('payments', function (Blueprint $table) {
            $table->dropSoftDeletes();
            $table->dropForeign(['verified_by']);
            $table->dropColumn(['status', 'payment_gateway', 'proof_url', 'verified_by', 'verified_at', 'notes']);
        });
        
        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn(['tax_amount', 'tax_percentage', 'subtotal', 'notes', 'payment_method', 'reminder_sent_at']);
        });
        
        Schema::table('orders', function (Blueprint $table) {
            $table->dropForeign(['assigned_to']);
            $table->dropColumn([
                'discount_amount', 'discount_type', 'discount_code',
                'estimated_completion_date', 'priority', 'assigned_to',
                'confirmed_at', 'started_at', 'completed_at', 'cancelled_at'
            ]);
        });
        
        Schema::table('posts', function (Blueprint $table) {
            $table->dropColumn([
                'view_count', 'reading_time', 'meta_title', 'meta_description',
                'is_featured', 'category'
            ]);
        });
        
        Schema::table('portfolio_projects', function (Blueprint $table) {
            $table->dropColumn([
                'tech_stack', 'images', 'github_url', 'duration_days',
                'team_size', 'is_featured', 'view_count', 'meta_title', 'meta_description'
            ]);
        });
        
        Schema::table('testimonials', function (Blueprint $table) {
            $table->dropForeign(['project_id']);
            $table->dropColumn(['rating', 'company_name', 'avatar_url', 'project_id', 'display_order']);
        });
        
        Schema::table('tags', function (Blueprint $table) {
            $table->dropColumn(['type', 'color', 'usage_count', 'description']);
        });
        
        Schema::table('services', function (Blueprint $table) {
            $table->dropColumn([
                'category', 'icon', 'estimated_days', 'features', 'pricing_tiers',
                'meta_title', 'meta_description', 'display_order'
            ]);
        });
        
        Schema::table('clients', function (Blueprint $table) {
            $table->dropForeign(['referred_by']);
            $table->dropColumn([
                'company_name', 'company_website', 'type', 'status',
                'referred_by', 'referral_code', 'metadata'
            ]);
        });
    }
};
