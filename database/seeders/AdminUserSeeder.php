<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\Eloquent\Model;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kita unguard sementara agar bisa mengisi kolom is_admin
        Model::unguard();

        // Admin 1: Super Admin
        User::updateOrCreate(
            ['email' => 'admin@ciptakoding.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ]
        );

        // Admin 2: Owner
        User::updateOrCreate(
            ['email' => 'owner@ciptakoding.com'],
            [
                'name' => 'Irfan Arfianto', // Owner Name
                'password' => Hash::make('password'),
                'is_admin' => true,
                'email_verified_at' => now(),
            ]
        );

        Model::reguard();
        
        $this->command->info('✅ 2 Admin accounts created successfully!');
        $this->command->info('   1. admin@ciptakoding.com / password');
        $this->command->info('   2. owner@ciptakoding.com / password');
    }
}
