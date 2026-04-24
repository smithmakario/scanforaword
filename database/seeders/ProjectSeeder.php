<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $message = \App\Models\Message::create([
            'title' => 'Understanding Faith',
            'description' => 'A comprehensive teaching on the nature and power of faith.',
            'full_url' => 'https://example.com/full-message/faith',
            'speaker' => 'Apostle Segun Obadje',
        ]);

        $snippet = $message->snippets()->create([
            'title' => 'The Definition of Faith',
            'video_url' => 'https://example.com/snippets/faith-def.mp4',
            'thumbnail_url' => 'https://example.com/thumbnails/faith.jpg',
            'duration' => 90,
        ]);

        $keyword = \App\Models\Keyword::create(['name' => 'faith']);
        $keyword2 = \App\Models\Keyword::create(['name' => 'grace']);

        $snippet->keywords()->attach([$keyword->id, $keyword2->id]);

        $cat1 = \App\Models\Category::create(['name' => 'Faith']);
        $cat2 = \App\Models\Category::create(['name' => 'Growth']);

        \App\Models\DailyWord::create([
            'snippet_id' => $snippet->id,
            'category_id' => $cat1->id,
            'scheduled_for' => now()->toDateString(),
        ]);
    }
}
