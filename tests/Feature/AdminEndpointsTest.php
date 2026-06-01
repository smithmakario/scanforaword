<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminEndpointsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_dashboard_is_available_to_admin_users(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonStructure([
                'status',
                'data' => [
                    'users',
                    'creators',
                    'messages',
                    'snippets',
                    'bookmarks',
                    'categories',
                    'daily_words',
                ],
            ]);
    }

    public function test_non_admin_users_cannot_access_admin_dashboard(): void
    {
        /** @var User $user */
        $user = User::factory()->create([
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/admin/dashboard')
            ->assertStatus(403);
    }

    public function test_admin_can_update_a_user_role(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        /** @var User $user */
        $user = User::factory()->create([
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/admin/users/{$user->id}/role", [
                'role' => 'creator',
            ])
            ->assertOk()
            ->assertJsonPath('data.role', 'creator');

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'role' => 'creator',
        ]);
    }

    public function test_unverified_admin_cannot_access_admin_dashboard_api(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'email_verified_at' => null,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/dashboard')
            ->assertStatus(403)
            ->assertJsonPath('status', 'error');
    }

    public function test_guest_is_redirected_to_admin_login_page(): void
    {
        $this->get('/admin')
            ->assertRedirect('/admin/login');
    }
}
