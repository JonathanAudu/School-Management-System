<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\StudentController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/complete', [ProfileController::class, 'completeProfile']);

    // Admin-only management
    Route::middleware('role:admin')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);

        // Dashboard Metrics
        Route::get('/dashboard/admin', [\App\Http\Controllers\Api\DashboardController::class, 'adminMetrics']);

        // Staff Management
        Route::get('/staff/lookups', [\App\Http\Controllers\Api\StaffController::class, 'getLookups']);
        Route::get('/staff/export', [\App\Http\Controllers\Api\StaffController::class, 'exportCsv']);
        Route::apiResource('staff', \App\Http\Controllers\Api\StaffController::class);

        // Students Management (create / list / export - editing is shared with staff below)
        Route::get('/students', [StudentController::class, 'index']);
        Route::post('/students', [StudentController::class, 'store']);
        Route::get('/students/export', [StudentController::class, 'exportCsv']);
        Route::post('/students/bulk', [StudentController::class, 'bulkUpload']);

        // Academics Management
        Route::apiResource('academic-sessions', \App\Http\Controllers\Api\AcademicSessionController::class);
        Route::apiResource('terms', \App\Http\Controllers\Api\TermController::class);
        Route::post('school-classes/bulk', [\App\Http\Controllers\Api\SchoolClassController::class, 'bulkStore']);
        Route::apiResource('school-classes', \App\Http\Controllers\Api\SchoolClassController::class);

        // Subjects Management
        Route::apiResource('subject-categories', \App\Http\Controllers\Api\SubjectCategoryController::class);
        Route::apiResource('subjects', \App\Http\Controllers\Api\SubjectController::class);
        Route::get('class-subjects', [\App\Http\Controllers\Api\ClassSubjectController::class, 'index']);
        Route::post('class-subjects', [\App\Http\Controllers\Api\ClassSubjectController::class, 'store']);
        Route::post('class-subjects/copy', [\App\Http\Controllers\Api\ClassSubjectController::class, 'copy']);

        // Results & Grading (admin-only views/actions)
        Route::get('grading-scales', [\App\Http\Controllers\Api\GradingScaleController::class, 'index']);
        Route::post('grading-scales', [\App\Http\Controllers\Api\GradingScaleController::class, 'store']);
        Route::get('results/performance', [\App\Http\Controllers\Api\ResultController::class, 'getPerformanceOverview']);
        Route::get('promotions/candidates', [\App\Http\Controllers\Api\PromotionController::class, 'getPromotionCandidates']);
        Route::post('promotions/promote', [\App\Http\Controllers\Api\PromotionController::class, 'promoteStudents']);
        Route::get('result-approvals', [\App\Http\Controllers\Api\ResultApprovalController::class, 'index']);

        // Website Settings
        Route::post('/website/settings', [\App\Http\Controllers\Api\WebsiteSettingController::class, 'update']);
        Route::post('/website/settings/logo', [\App\Http\Controllers\Api\WebsiteSettingController::class, 'uploadLogo']);

        Route::apiResource('website/hero-slides', \App\Http\Controllers\Api\HeroSlideController::class);
        Route::apiResource('website/quick-stats', \App\Http\Controllers\Api\QuickStatController::class);
        Route::apiResource('website/leadership-members', \App\Http\Controllers\Api\LeadershipMemberController::class);
        Route::apiResource('website/news', \App\Http\Controllers\Api\NewsAnnouncementController::class);
        Route::apiResource('website/events', \App\Http\Controllers\Api\EventController::class);
        Route::apiResource('website/albums', \App\Http\Controllers\Api\PhotoAlbumController::class);
        Route::post('/website/photos', [\App\Http\Controllers\Api\PhotoController::class, 'store']);
        Route::delete('/website/photos/{photo}', [\App\Http\Controllers\Api\PhotoController::class, 'destroy']);
    });

    // Admin + any staff (teaching or non-teaching) - non-academic actions only
    Route::middleware('role:admin,staff,teacher')->group(function () {
        Route::get('/dashboard/staff', [\App\Http\Controllers\Api\DashboardController::class, 'staffMetrics']);

        Route::get('/lookups', [StudentController::class, 'getLookups']);
        Route::put('/students/{id}', [StudentController::class, 'update']);
    });

    // Admin + teachers only - academic decisions (non-teaching staff like bursar/accountant are excluded)
    Route::middleware('role:admin,teacher')->group(function () {
        Route::post('results/grid', [\App\Http\Controllers\Api\ResultController::class, 'getGrid']);
        Route::post('results/save', [\App\Http\Controllers\Api\ResultController::class, 'saveResults']);
        Route::post('result-approvals/status', [\App\Http\Controllers\Api\ResultApprovalController::class, 'updateStatus']);

        Route::get('/student-subjects/approvals', [\App\Http\Controllers\Api\StudentSubjectController::class, 'getRegistrationApprovals']);
        Route::get('/student-subjects/pending-count', [\App\Http\Controllers\Api\StudentSubjectController::class, 'getPendingCount']);
        Route::post('/student-subjects/approve', [\App\Http\Controllers\Api\StudentSubjectController::class, 'approveSubject']);
    });

    // Shared: admin/staff/teacher act on behalf of a student, or a student acts on their own record
    // (controllers enforce ownership for the 'student' role - see StudentSubjectController / ReportCardController)
    Route::middleware('role:admin,staff,teacher,student')->group(function () {
        Route::get('/student/subjects/available', [\App\Http\Controllers\Api\StudentSubjectController::class, 'availableSubjects']);
        Route::post('/student/subjects/register', [\App\Http\Controllers\Api\StudentSubjectController::class, 'registerSubjects']);
        Route::get('report-card/{studentId}', [\App\Http\Controllers\Api\ReportCardController::class, 'generateStudentReport']);
    });

    // Student self-service only
    Route::middleware('role:student')->group(function () {
        Route::get('/student/dashboard/notifications', [StudentController::class, 'getDashboardNotifications']);
        Route::get('/student/class', [StudentController::class, 'getMyClassDetails']);
        Route::get('/student/grades', [StudentController::class, 'getMyGrades']);
    });
});

// Public Website Routes
Route::get('/website/settings', [\App\Http\Controllers\Api\WebsiteSettingController::class, 'index']);
Route::get('/website/hero-slides', [\App\Http\Controllers\Api\HeroSlideController::class, 'index']);
Route::get('/website/quick-stats', [\App\Http\Controllers\Api\QuickStatController::class, 'index']);
Route::get('/website/leadership-members', [\App\Http\Controllers\Api\LeadershipMemberController::class, 'index']);
Route::get('/website/news', [\App\Http\Controllers\Api\NewsAnnouncementController::class, 'index']);
Route::get('/website/events', [\App\Http\Controllers\Api\EventController::class, 'index']);
Route::get('/website/albums', [\App\Http\Controllers\Api\PhotoAlbumController::class, 'index']);
Route::get('/website/staff', [\App\Http\Controllers\Api\StaffController::class, 'index']);
