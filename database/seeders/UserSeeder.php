<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'is_admin' => true,
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );

        // Author
        User::updateOrCreate(
            ['email' => 'author@example.com'],
            [
                'name' => 'Author',
                'password' => Hash::make('password'),
                'is_admin' => true, // atau false jika mau batasi
                'email_verified_at' => now(),
                'remember_token' => Str::random(10),
            ]
        );
    }
}
