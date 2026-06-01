<?php

namespace Tests\Feature;

use App\Models\Message;
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
                'mode' => 'direct',
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

    public function test_creator_can_submit_indirect_upload_links(): void
    {
        $creator = User::factory()->create([
            'role' => 'creator',
            'email_verified_at' => now(),
        ]);

        $response = $this->actingAs($creator, 'sanctum')
            ->post('/api/creator/upload', [
                'mode' => 'indirect',
                'title' => 'Indirect Upload Test',
                'keywords' => 'wisdom,hope',
                'audio_url' => 'https://audio.example.com/podcast.mp3',
                'image_url' => 'https://images.example.com/cover.jpg',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('data.audio_url', 'https://audio.example.com/podcast.mp3')
            ->assertJsonPath('data.image_url', 'https://images.example.com/cover.jpg');
    }

    public function test_creator_can_delete_own_message_and_supabase_objects(): void
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

        $creator = User::factory()->create([
            'role' => 'creator',
            'email_verified_at' => now(),
        ]);

        $message = Message::create([
            'title' => 'Delete Test',
            'description' => 'Remove this upload',
            'content' => 'Test content',
            'speaker' => 'Test Creator',
            'creator_id' => $creator->id,
            'full_url' => null,
            'audio_url' => 'https://test.supabase.co/storage/v1/object/public/creator-audio/creator_uploads/audio/test.mp3',
            'image_url' => 'https://test.supabase.co/storage/v1/object/public/creator-images/creator_uploads/image/test.jpg',
            'status' => 'processing',
            'duration' => '00:02:30',
        ]);

        $response = $this->actingAs($creator, 'sanctum')
            ->delete('/api/creator/messages/'.$message->id);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Message deleted successfully.');

        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
        Http::assertSentCount(2);
    }

    public function test_admin_can_delete_message(): void
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

        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $message = Message::create([
            'title' => 'Admin Delete Test',
            'description' => 'Admin remove upload',
            'content' => 'Test content',
            'speaker' => 'Admin',
            'creator_id' => $admin->id,
            'full_url' => null,
            'audio_url' => 'https://test.supabase.co/storage/v1/object/public/creator-audio/creator_uploads/audio/admin.mp3',
            'image_url' => 'https://test.supabase.co/storage/v1/object/public/creator-images/creator_uploads/image/admin.jpg',
            'status' => 'processing',
            'duration' => '00:02:30',
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->delete('/api/admin/messages/'.$message->id);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success')
            ->assertJsonPath('message', 'Message removed successfully.');

        $this->assertDatabaseMissing('messages', ['id' => $message->id]);
    }
}
