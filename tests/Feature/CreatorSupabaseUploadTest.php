<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class CreatorSupabaseUploadTest extends TestCase
{
    use RefreshDatabase;

    public function test_creator_uploads_audio_and_image_to_supabase_bucket(): void
    {
        Http::fake([
            '*' => Http::response([], 200),
        ]);

        config([
            'services.supabase.url' => 'https://test.supabase.co',
            'services.supabase.key' => 'test-service-key',
            'services.supabase.audio_bucket' => 'creator-audio',
            'services.supabase.image_bucket' => 'creator-images',
        ]);

        /** @var User $creator */
        $creator = User::factory()->create([
            'role' => 'creator',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($creator, 'sanctum')
            ->post('/api/creator/upload', [
                'title' => 'Supabase Upload Test',
                'keywords' => 'faith,grace',
                'audio_file' => UploadedFile::fake()->create('sample.mp3', 1000, 'audio/mpeg'),
                'image_file' => UploadedFile::fake()->create('cover.jpg', 300, 'image/jpeg'),
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonStructure([
                'status',
                'message',
                'data' => ['title', 'audio_url', 'image_url'],
            ]);

        Http::assertSentCount(2);
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'storage/v1/object/creator-audio/') &&
                $request->hasHeader('Authorization') &&
                $request->header('Authorization')[0] === 'Bearer test-service-key';
        });
        Http::assertSent(function ($request) {
            return str_contains($request->url(), 'storage/v1/object/creator-images/') &&
                $request->hasHeader('Authorization') &&
                $request->header('Authorization')[0] === 'Bearer test-service-key';
        });
    }
}
