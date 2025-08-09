<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Testimonial;
use Illuminate\Database\Seeder;
use Faker\Factory as Faker;

class TestimonialSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        $clients = Client::inRandomOrder()->take(6)->get();
        foreach ($clients as $i => $client) {
            Testimonial::create([
                'client_id'       => $client->id,
                'client_name'     => $client->name,
                'client_position' => $faker->jobTitle(),
                'content'         => $faker->paragraph(3),
                'is_featured'     => $i < 3, // 3 testimoni unggulan
            ]);
        }
    }
}
