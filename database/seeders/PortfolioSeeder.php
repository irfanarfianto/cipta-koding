<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\PortfolioProject;
use App\Models\Tag;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class PortfolioSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');
        $tagsAll = Tag::pluck('id')->all();
        $clients = Client::inRandomOrder()->take(8)->get();

        for ($i=0; $i<10; $i++) {
            $title = $faker->company().' Website';
            $project = PortfolioProject::create([
                'title'           => $title,
                'slug'            => Str::slug($title).'-'.Str::random(5),
                'description'     => $faker->paragraph(4),
                'project_url'     => $faker->boolean() ? 'https://example.com/'.Str::slug($title) : null,
                'cover_image_url' => null,
                'completed_date'  => now()->subDays(rand(10, 500))->toDateString(),
                'client_id'       => optional($clients->random())->id,
                'client_name'     => optional($clients->random())->name,
            ]);

            // attach 2–4 tags
            $attach = collect($tagsAll)->shuffle()->take(rand(2,4))->all();
            $project->tags()->sync($attach);
        }
    }
}
