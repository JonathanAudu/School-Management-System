'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import Image from 'next/image';

export default function ProfileManagement() {
    const { user, isLoading, updateUser } = useAuth();
    const router = useRouter();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else {
                setName(user.name);
                setEmail(user.email);
                if (user.profile_picture) {
                    setPreviewUrl(`http://localhost:8000/storage/${user.profile_picture}`);
                }
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) return <div className="p-10 text-center">Loading profile...</div>;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ type: '', text: '' });

        if (user.role === 'student' && !profilePicture) {
            setMessage({ type: 'error', text: 'Please select a new profile picture first.' });
            setSaving(false);
            return;
        }

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        if (profilePicture) {
            formData.append('profile_picture', profilePicture);
        }

        try {
            const res = await axios.post('/api/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            updateUser(res.data.user);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 md:py-12 flex justify-center items-center min-h-[calc(100vh-8rem)]">
            <div className="w-full max-w-4xl bg-surface-container-low p-8 md:p-10 rounded-3xl shadow-sm border border-outline/10">
                <h1 className="text-3xl font-bold mb-6 font-serif text-on-surface">Profile Management</h1>
                
                {user.role === 'student' && (
                    <div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-600 border border-yellow-500/15 mb-6 text-sm flex items-start gap-3">
                        <span className="text-lg">ℹ️</span>
                        <div>
                            <p className="text-xs text-on-surface-variant font-medium">As a student, your profile information is managed by the school administration and cannot be modified directly. However, you can still update your profile picture.</p>
                        </div>
                    </div>
                )}

                {message.text && (
                    <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === 'success' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div className="relative w-40 h-40 rounded-full overflow-hidden bg-surface-container-highest mb-4 border-4 border-surface shadow-lg">
                                {previewUrl ? (
                                    <Image src={previewUrl} alt="Profile" fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-5xl text-on-surface-variant font-bold">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <label className="cursor-pointer bg-surface-container hover:bg-surface-container-high text-on-surface py-2 px-5 rounded-lg text-sm font-medium transition-colors border border-outline/10">
                                Change Picture
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>

                        {/* Fields Section */}
                        <div className="flex-1 w-full space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        disabled={user.role === 'student'}
                                        className={`appearance-none rounded-xl block w-full px-4 py-3 border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary ${
                                            user.role === 'student'
                                                ? 'border-outline/10 bg-surface-container text-on-surface-variant cursor-not-allowed'
                                                : 'border-outline/20 bg-surface-container-lowest focus:border-primary'
                                        }`}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        disabled={user.role === 'student'}
                                        className={`appearance-none rounded-xl block w-full px-4 py-3 border text-on-surface focus:outline-none focus:ring-2 focus:ring-primary ${
                                            user.role === 'student'
                                                ? 'border-outline/10 bg-surface-container text-on-surface-variant cursor-not-allowed'
                                                : 'border-outline/20 bg-surface-container-lowest focus:border-primary'
                                        }`}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-on-surface mb-2">Role</label>
                                <input
                                    type="text"
                                    disabled
                                    className="appearance-none rounded-xl block w-full px-4 py-3 border border-outline/10 bg-surface-container text-on-surface-variant cursor-not-allowed capitalize"
                                    value={user.role}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-outline/10 flex justify-end gap-4 mt-8">
                        <button type="button" onClick={() => router.push(`/${user.role}`)} className="px-6 py-2 rounded-xl text-on-surface-variant border border-outline/20 hover:bg-surface-container transition-colors font-medium">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="btn-primary py-2 px-6">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
