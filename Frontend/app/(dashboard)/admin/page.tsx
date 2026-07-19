'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AdminDashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const [metrics, setMetrics] = useState<any>(null);
    const [charts, setCharts] = useState<any>(null);
    const [sessionString, setSessionString] = useState<string>('Loading...');

    const COLORS = ['#0ea5e9', '#ec4899', '#f59e0b', '#10b981', '#8b5cf6'];

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'admin') {
                router.push(`/${user.role}`);
            } else {
                fetchDashboardData();
            }
        }
    }, [user, isLoading, router]);

    const fetchDashboardData = async () => {
        try {
            const res = await axios.get('/api/dashboard/admin');
            setMetrics(res.data.metrics);
            setCharts(res.data.charts);
            setSessionString(res.data.session);
        } catch (err) {
            console.error('Failed to load dashboard data', err);
        }
    };

    if (isLoading || !user || !metrics) return <div className="p-10 text-center text-on-surface-variant animate-pulse">Loading dashboard...</div>;

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-on-surface">Dashboard</h1>
                    <p className="text-on-surface-variant mt-1">Welcome back, <strong className="text-on-surface">{user.name}</strong>. Here's what's happening today.</p>
                </div>
                <div className="text-right bg-surface-container-low px-4 py-2 rounded-lg border border-outline/20 shadow-sm">
                    <p className="text-xs text-on-surface-variant uppercase font-bold">Current Session</p>
                    <p className="font-semibold text-on-surface">{sessionString}</p>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline/10 shadow-sm flex flex-col justify-center">
                    <span className="text-on-surface-variant text-xs font-semibold mb-1 flex items-center gap-2">👨‍🎓 Total Students</span>
                    <span className="text-2xl font-bold text-on-surface">{metrics.total}</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline/10 shadow-sm flex flex-col justify-center">
                    <span className="text-on-surface-variant text-xs font-semibold mb-1 flex items-center gap-2">👨 Male</span>
                    <span className="text-2xl font-bold text-on-surface">{metrics.male}</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline/10 shadow-sm flex flex-col justify-center">
                    <span className="text-on-surface-variant text-xs font-semibold mb-1 flex items-center gap-2">👩 Female</span>
                    <span className="text-2xl font-bold text-on-surface">{metrics.female}</span>
                </div>
                <div className="bg-surface-container-low p-4 rounded-xl border border-outline/10 shadow-sm flex flex-col justify-center">
                    <span className="text-on-surface-variant text-xs font-semibold mb-1 flex items-center gap-2">✅ Active</span>
                    <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-on-surface">{metrics.active}</span>
                        <span className="text-xs text-on-surface-variant font-medium mb-1">{metrics.inactive} inactive</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Analytics Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <h2 className="text-lg font-bold font-serif text-on-surface">Analytics Overview</h2>
                    {charts ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Gender Distribution Pie Chart */}
                            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline/10 shadow-sm">
                                <h3 className="text-sm font-bold text-on-surface mb-4">Students by Gender</h3>
                                <div className="h-[240px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={charts.gender}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                                            >
                                                {charts.gender.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', borderColor: 'transparent', borderRadius: '12px', color: 'var(--color-on-surface)', fontSize: '12px' }}
                                                itemStyle={{ color: 'var(--color-on-surface)' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Class Distribution Bar Chart */}
                            <div className="bg-surface-container-low p-5 rounded-2xl border border-outline/10 shadow-sm">
                                <h3 className="text-sm font-bold text-on-surface mb-4">Students by Level</h3>
                                <div className="h-[240px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={charts.classDistribution}
                                            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-outline)" strokeOpacity={0.1} vertical={false} />
                                            <XAxis 
                                                dataKey="name" 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 10 }} 
                                                dy={10}
                                                angle={-35}
                                                textAnchor="end"
                                            />
                                            <YAxis 
                                                axisLine={false} 
                                                tickLine={false} 
                                                tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 10 }} 
                                            />
                                            <Tooltip 
                                                cursor={{ fill: 'var(--color-surface-container-highest)', opacity: 0.5 }}
                                                contentStyle={{ backgroundColor: 'var(--color-surface-container-high)', borderColor: 'transparent', borderRadius: '12px', color: 'var(--color-on-surface)', fontSize: '12px' }}
                                            />
                                            <Bar dataKey="students" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={24}>
                                                {charts.classDistribution.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-[240px] bg-surface-container rounded-2xl border border-outline/10 flex items-center justify-center text-on-surface-variant animate-pulse">
                            Loading charts...
                        </div>
                    )}
                </div>

                {/* Right Side: Quick Shortcuts */}
                <div>
                    <h2 className="text-lg font-bold font-serif mb-6 text-on-surface">Quick Shortcuts</h2>
                    <div className="space-y-3">
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline/10 shadow-sm hover:border-primary/50 hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-4" onClick={() => router.push('/admin/students')}>
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center text-xl">🎓</div>
                            <div className="font-bold text-on-surface">Students Directory</div>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline/10 shadow-sm hover:border-secondary/50 hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-4" onClick={() => router.push('/admin/staff')}>
                            <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-lg flex items-center justify-center text-xl">👨‍🏫</div>
                            <div className="font-bold text-on-surface">Staff Directory</div>
                        </div>
                        <div className="p-4 bg-surface-container-low rounded-xl border border-outline/10 shadow-sm hover:border-blue-500/50 hover:bg-surface-container transition-colors cursor-pointer flex items-center gap-4" onClick={() => router.push('/admin/academics/classes')}>
                            <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-lg flex items-center justify-center text-xl">📚</div>
                            <div className="font-bold text-on-surface">Academics Setup</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
