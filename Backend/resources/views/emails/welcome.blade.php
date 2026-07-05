<!DOCTYPE html>
<html>
<head>
    <title>Welcome to the School Portal</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2>Welcome, {{ $user->name }}!</h2>
    <p>Your account has been successfully created on our School Portal.</p>
    
    <p>Please use the following One-Time Password (OTP) to log in to your account for the first time:</p>
    
    <h3 style="background-color: #f4f4f4; padding: 10px; display: inline-block; border-radius: 5px;">{{ $otp }}</h3>
    
    <p><strong>Note:</strong> Upon your first login, you will be required to change your password and complete your profile.</p>
    
    <div style="margin: 20px 0;">
        <a href="{{ env('FRONTEND_URL', 'http://localhost:3000') }}/login" style="background-color: #0284c7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Click here to Login</a>
    </div>

    <br>
    <p>Best regards,<br>School Administration</p>
</body>
</html>
