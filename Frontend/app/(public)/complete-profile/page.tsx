'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';

export default function CompleteProfile() {
    const { user, login } = useAuth();
    const router = useRouter();
    
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== passwordConfirmation) {
            return setError('Passwords do not match.');
        }
        if (!profilePicture) {
            return setError('Please select a profile picture.');
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('password', password);
        formData.append('password_confirmation', passwordConfirmation);
        formData.append('profile_picture', profilePicture);

        try {
            const response = await axios.post('/api/profile/complete', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            // Update auth state with new user object
            login(localStorage.getItem('token') || '', response.data.user);

            // Redirect based on role
            const role = response.data.user.role;
            if (role === 'admin') router.push('/admin');
            else if (role === 'staff') router.push('/staff');
            else if (role === 'student') router.push('/student');
            else if (role === 'parent') router.push('/parent');
            else router.push('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to complete profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-3xl shadow-lg border border-slate-100">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 font-serif">
                        Complete Your Profile
                    </h2>
                    <p className="mt-2 text-center text-sm text-slate-600">
                        Please set a new password and upload a profile picture to continue.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Picture</label>
                            <input
                                type="file"
                                accept="image/*"
                                required
                                className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-70 transition-all"
                        >
                            {loading ? 'Saving...' : 'Save and Continue'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
