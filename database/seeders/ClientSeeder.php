<?php

namespace Database\Seeders;

use App\Models\Client;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class ClientSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        // beberapa fixed clients
        $fixed = [
            ['PT Sinar Terang', 'kontak@sinarterang.co.id'],
            ['CV Maju Mundur', 'halo@majumundur.co.id'],
            ['Kopi Nusantara', 'owner@kopinusantara.id'],
            ['Roti Enak', 'cs@rotienak.id'],
        ];

        foreach ($fixed as [$name, $email]) {
            Client::updateOrCreate(
                ['email' => $email],
                [
                    'name' => $name,
                    'phone_number' => $faker->phoneNumber(),
                    'address' => $faker->address(),
                ]
            );
        }

        // random clients
        for ($i=0; $i<16; $i++) {
            Client::firstOrCreate(
                ['email' => $faker->unique()->safeEmail()],
                [
                    'name' => $faker->company(),
                    'phone_number' => $faker->phoneNumber(),
                    'address' => $faker->address(),
                ]
            );
        }
    }
}
