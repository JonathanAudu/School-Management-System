'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ParentDashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'parent') {
                router.push(`/${user.role}`);
            }
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) return <div className="p-10 text-center">Loading dashboard...</div>;

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-6 font-serif text-on-surface">Parent Dashboard</h1>
            <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface">
                <p className="text-lg mb-4">Welcome back, <strong className="text-primary">{user.name}</strong>!</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="p-6 bg-surface-container rounded-2xl border border-outline/10">
                        <h3 className="font-bold mb-2 text-on-surface">My Children</h3>
                        <p className="text-sm text-on-surface-variant mb-4">View grades and attendance for your children.</p>
                        <button className="text-primary font-medium text-sm">View Details &rarr;</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
