<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->string('staff_type')->default('Non-Teaching')->after('department_id');
        });

        $teachingDeptId = DB::table('departments')->where('name', 'Teaching')->value('id');

        if ($teachingDeptId) {
            DB::table('staff')->where('department_id', $teachingDeptId)->update(['staff_type' => 'Teaching']);
        }

        Schema::table('staff', function (Blueprint $table) {
            $table->dropForeign(['department_id']);
            $table->dropColumn('department_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('staff', function (Blueprint $table) {
            $table->foreignId('department_id')->nullable()->after('user_id')->constrained();
            $table->dropColumn('staff_type');
        });
    }
};
