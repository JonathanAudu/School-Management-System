<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->string('level_name'); // e.g., "JSS1" or "Year 7"
            $table->string('arm_name'); // e.g., "A", "Diamond"
            $table->string('full_name')->unique(); // e.g., "JSS1 Diamond"
            $table->integer('capacity')->default(30);
            $table->foreignId('teacher_id')->nullable()->constrained('staff')->onDelete('set null');
            $table->string('room_number')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('school_classes');
    }
};
