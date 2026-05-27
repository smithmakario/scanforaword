<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreatorRoleProtectionTest extends TestCase
{
    use RefreshDatabase;

    public function test_creator_dashboard_routes_are_restricted_to_creator_users(): void
    {
        $user = User::factory()->create([
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/creator/stats')
            ->assertStatus(403);

        $creator = User::factory()->create([
            'role' => 'creator',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($creator, 'sanctum')
            ->getJson('/api/creator/stats')
            ->assertStatus(200);
    }
}
