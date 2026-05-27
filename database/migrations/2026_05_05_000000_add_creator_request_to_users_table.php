<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('creator_request_status', ['none', 'pending', 'approved', 'rejected'])
                  ->default('none')
                  ->after('role');
            $table->timestamp('creator_requested_at')->nullable()->after('creator_request_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['creator_request_status', 'creator_requested_at']);
        });
    }
};