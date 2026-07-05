<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academic_sessions', function (Blueprint $table) {
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->enum('status', ['upcoming', 'active', 'completed'])->default('upcoming');
        });

        // Set status based on existing is_current
        DB::table('academic_sessions')->where('is_current', 1)->update(['status' => 'active']);

        Schema::table('academic_sessions', function (Blueprint $table) {
            $table->dropColumn('is_current');
        });

        Schema::table('terms', function (Blueprint $table) {
            $table->foreignId('academic_session_id')->nullable()->constrained()->onDelete('cascade');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
        });

        // Assign existing terms to the active academic session
        $activeSession = DB::table('academic_sessions')->where('status', 'active')->first();
        if ($activeSession) {
            DB::table('terms')->update(['academic_session_id' => $activeSession->id]);
        }
    }

    public function down(): void
    {
        Schema::table('terms', function (Blueprint $table) {
            $table->dropForeign(['academic_session_id']);
            $table->dropColumn(['academic_session_id', 'start_date', 'end_date']);
        });

        Schema::table('academic_sessions', function (Blueprint $table) {
            $table->boolean('is_current')->default(false);
        });

        DB::table('academic_sessions')->where('status', 'active')->update(['is_current' => 1]);

        Schema::table('academic_sessions', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date', 'status']);
        });
    }
};
