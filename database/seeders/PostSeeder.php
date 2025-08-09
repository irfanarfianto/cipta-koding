<?php

namespace Database\Seeders;

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use Faker\Factory as Faker;

class PostSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('id_ID');

        $author = User::where('email','author@example.com')->first()
            ?? User::first();

        if (! $author) {
            return;
        }

        $tagsAll = Tag::pluck('id')->all();

        for ($i=0; $i<12; $i++) {
            $title = ucfirst($faker->words(rand(3,6), true));
            $post = Post::create([
                'user_id'        => $author->id,
                'title'          => $title,
                'slug'           => Str::slug($title).'-'.Str::random(5),
                'excerpt'        => $faker->sentence(15),
                'body'           => collect(range(1,5))->map(fn()=>'<p>'.$faker->paragraph(5).'</p>')->implode("\n"),
                'cover_image_url'=> null,
                'status'         => $faker->randomElement(['draft','published']),
                'published_at'   => $faker->boolean(70) ? now()->subDays(rand(1, 120)) : null,
            ]);

            $attach = collect($tagsAll)->shuffle()->take(rand(1,3))->all();
            $post->tags()->sync($attach);
        }
    }
}
