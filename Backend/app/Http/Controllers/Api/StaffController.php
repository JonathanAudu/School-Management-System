<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\Department;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\WelcomeUserMail;
use Illuminate\Support\Str;

class StaffController extends Controller
{
    public function index(Request $request)
    {
        $query = Staff::with(['department', 'user', 'classes', 'classSubjects.subject', 'classSubjects.schoolClass', 'classSubjects.academicSession']);

        if ($request->department_id) $query->where('department_id', $request->department_id);
        if ($request->gender) $query->where('gender', $request->gender);
        if ($request->status) $query->where('status', $request->status);
        if ($request->position) $query->where('position', $request->position);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('staff_id', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        $staff = $query->paginate(10);

        // Metrics
        $total = Staff::count();
        $active = Staff::where('status', 'Active')->count();
        $male = Staff::where('gender', 'Male')->count();
        $female = Staff::where('gender', 'Female')->count();
        
        $teachingDept = Department::where('name', 'Teaching')->first();
        $teaching = $teachingDept ? Staff::where('department_id', $teachingDept->id)->count() : 0;
        $nonTeaching = $total - $teaching;

        return response()->json([
            'staff' => $staff,
            'metrics' => [
                'total' => $total,
                'active' => $active,
                'teaching' => $teaching,
                'non_teaching' => $nonTeaching,
                'male' => $male,
                'female' => $female,
            ]
        ]);
    }

    public function getLookups()
    {
        return response()->json([
            'departments' => Department::all(),
        ]);
    }

    private function generateStaffId()
    {
        $year = date('Y');
        
        $latestStaff = Staff::where('staff_id', 'like', "STF/{$year}/%")
                            ->orderBy('staff_id', 'desc')
                            ->first();

        $sequence = 1;
        if ($latestStaff) {
            $parts = explode('/', $latestStaff->staff_id);
            if (count($parts) === 3) {
                $sequence = (int) $parts[2] + 1;
            }
        }

        return sprintf("STF/%s/%03d", $year, $sequence);
    }

    private function createUserAndSendOTP($name, $email, $role)
    {
        $user = User::where('email', $email)->first();
        if ($user) return $user;

        $otp = strtoupper(Str::random(6));
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => $otp,
            'role' => $role,
            'force_password_reset' => true,
        ]);

        Mail::to($email)->send(new WelcomeUserMail($user, $otp));

        return $user;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string',
            'last_name' => 'required|string',
            'middle_name' => 'nullable|string',
            'gender' => 'required|string',
            'phone' => 'required|string',
            'email' => 'required|email|unique:staff,email|unique:users,email',
            'date_of_birth' => 'required|date',
            'department_id' => 'required|exists:departments,id',
            'position' => 'nullable|string',
        ]);

        $validated['staff_id'] = $this->generateStaffId();
        $validated['status'] = 'Active';

        $role = 'staff';
        $dept = Department::find($validated['department_id']);
        if ($dept && $dept->name === 'Teaching') {
            $role = 'teacher';
        }

        $user = $this->createUserAndSendOTP("{$validated['first_name']} {$validated['last_name']}", $validated['email'], $role);
        $validated['user_id'] = $user->id;

        $staff = Staff::create($validated);

        return response()->json(['staff' => $staff, 'message' => 'Staff added successfully'], 201);
    }

    public function update(Request $request, $id)
    {
        $staff = Staff::findOrFail($id);
        
        $validated = $request->validate([
            'first_name' => 'sometimes|string',
            'last_name' => 'sometimes|string',
            'middle_name' => 'nullable|string',
            'gender' => 'sometimes|string',
            'phone' => 'sometimes|string',
            'email' => 'sometimes|email|unique:staff,email,'.$id,
            'date_of_birth' => 'sometimes|date',
            'department_id' => 'sometimes|exists:departments,id',
            'position' => 'nullable|string',
            'status' => 'sometimes|string',
        ]);

        $staff->update($validated);

        if (isset($validated['email']) && $staff->user) {
            $staff->user->update(['email' => $validated['email']]);
        }

        return response()->json(['staff' => $staff, 'message' => 'Staff updated successfully']);
    }

    public function exportCsv(Request $request)
    {
        $query = Staff::with(['department', 'user']);

        if ($request->department_id) $query->where('department_id', $request->department_id);
        if ($request->gender) $query->where('gender', $request->gender);
        if ($request->status) $query->where('status', $request->status);
        if ($request->position) $query->where('position', $request->position);

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('first_name', 'like', "%{$request->search}%")
                  ->orWhere('last_name', 'like', "%{$request->search}%")
                  ->orWhere('staff_id', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%")
                  ->orWhere('phone', 'like', "%{$request->search}%");
            });
        }

        $staffList = $query->get();

        $headers = array(
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=staff_export.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        );

        $columns = ['Staff ID', 'First Name', 'Middle Name', 'Last Name', 'Department', 'Position', 'Gender', 'Phone', 'Email', 'Date of Birth', 'Status'];

        $callback = function() use($staffList, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($staffList as $staff) {
                $row = [
                    $staff->staff_id,
                    $staff->first_name,
                    $staff->middle_name,
                    $staff->last_name,
                    $staff->department->name ?? '',
                    $staff->position,
                    $staff->gender,
                    $staff->phone,
                    $staff->email,
                    $staff->date_of_birth,
                    $staff->status,
                ];
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }
}
