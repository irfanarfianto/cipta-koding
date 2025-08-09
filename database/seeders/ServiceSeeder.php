<?php

namespace Database\Seeders;

use App\Models\Service;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ServiceSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['Website Company Profile', 5000000, true],
            ['E-Commerce Development', 12000000, true],
            ['UI/UX Design', 4000000, true],
            ['SEO Optimization', 3000000, true],
            ['Mobile App (Flutter)', 15000000, true],
            ['Maintenance & Support', 1500000, true],
        ];

        foreach ($data as [$name, $price, $active]) {
            Service::updateOrCreate(
                ['slug' => Str::slug($name)],
                [
                    'name' => $name,
                    'description' => "Paket $name untuk kebutuhan bisnis Anda.",
                    'base_price' => $price,
                    'is_active' => $active,
                ]
            );
        }
    }
}
