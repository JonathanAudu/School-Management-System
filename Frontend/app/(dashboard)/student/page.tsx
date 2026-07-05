'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';

export default function StudentDashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isNotifLoading, setIsNotifLoading] = useState(true);

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'student') {
                router.push(`/${user.role}`);
            } else {
                fetchNotifications();
            }
        }
    }, [user, isLoading, router]);

    const fetchNotifications = async () => {
        setIsNotifLoading(true);
        try {
            const res = await axios.get('/api/student/dashboard/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to load dashboard notifications', err);
        } finally {
            setIsNotifLoading(false);
        }
    };

    if (isLoading || !user) return <div className="p-10 text-center text-on-surface-variant animate-pulse">Loading dashboard...</div>;

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-6 font-serif text-on-surface">Student Dashboard</h1>
            <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface">
                <p className="text-lg mb-6">Welcome back, <strong className="text-primary">{user.name}</strong>!</p>

                {/* Notifications Section */}
                {!isNotifLoading && notifications.length > 0 && (
                    <div className="mb-8 space-y-3">
                        <h2 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider flex items-center gap-2">
                            🔔 Notifications & Updates
                        </h2>
                        <div className="grid grid-cols-1 gap-3">
                            {notifications.map((notif) => {
                                let bgClass = 'bg-surface-container border-outline/10 text-on-surface';
                                let icon = '📢';
                                let actionBgClass = 'bg-primary text-on-primary hover:bg-primary/95';

                                if (notif.type === 'warning') {
                                    bgClass = 'bg-yellow-500/10 border-yellow-500/20 text-on-surface';
                                    icon = '⚠️';
                                    actionBgClass = 'bg-yellow-600 text-white hover:bg-yellow-700';
                                } else if (notif.type === 'success') {
                                    bgClass = 'bg-green-500/10 border-green-500/20 text-on-surface';
                                    icon = '✅';
                                    actionBgClass = 'bg-green-600 text-white hover:bg-green-700';
                                } else if (notif.type === 'info') {
                                    bgClass = 'bg-sky-500/10 border-sky-500/20 text-on-surface';
                                    icon = 'ℹ️';
                                    actionBgClass = 'bg-sky-600 text-white hover:bg-sky-700';
                                }

                                return (
                                    <div 
                                        key={notif.id} 
                                        className={`p-4 rounded-2xl border ${bgClass} flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all shadow-sm`}
                                    >
                                        <div className="flex gap-3">
                                            <span className="text-xl self-start sm:self-center">{icon}</span>
                                            <div>
                                                <h4 className="font-bold text-sm">{notif.title}</h4>
                                                <p className="text-xs text-on-surface-variant mt-0.5">{notif.message}</p>
                                            </div>
                                        </div>
                                        {notif.link && (
                                            <button 
                                                onClick={() => router.push(notif.link)}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 shadow-sm ${actionBgClass}`}
                                            >
                                                {notif.action_text} &rarr;
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Shortcuts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                    <div className="p-6 bg-surface-container rounded-2xl border border-outline/10">
                        <h3 className="font-bold mb-2 text-on-surface">My Classes</h3>
                        <p className="text-sm text-on-surface-variant mb-4">View your schedule and assignments.</p>
                        <button className="text-primary font-medium text-sm hover:underline" onClick={() => router.push('/student/classes')}>View Schedule &rarr;</button>
                    </div>
                    <div className="p-6 bg-surface-container rounded-2xl border border-outline/10">
                        <h3 className="font-bold mb-2 text-on-surface">Grades & Reports</h3>
                        <p className="text-sm text-on-surface-variant mb-4">Check your academic performance.</p>
                        <button className="text-primary font-medium text-sm hover:underline" onClick={() => router.push('/student/grades')}>View Grades &rarr;</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
