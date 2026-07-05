'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

import { useParams } from 'next/navigation';

export default function ClassDashboard() {
    const params = useParams();
    const id = params.id as string;
    const [schoolClass, setSchoolClass] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        fetchClassDetails();
    }, [id]);

    const fetchClassDetails = async () => {
        try {
            const res = await axios.get(`/api/school-classes/${id}`);
            setSchoolClass(res.data.school_class);
        } catch (err: any) {
            // Note: If you don't have a show route yet, we can fetch all and filter for now
            const fallbackRes = await axios.get('/api/school-classes');
            const cls = fallbackRes.data.school_classes.find((c: any) => c.id.toString() === id);
            if (cls) {
                setSchoolClass(cls);
            } else {
                toast.error('Failed to load class details');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading class dashboard...</div>;
    }

    if (!schoolClass) {
        return <div className="p-8 text-center text-red-500">Class not found.</div>;
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/academics/classes" className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                    <span className="text-xl">&larr;</span>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold font-serif text-on-surface flex items-center gap-3">
                        {schoolClass.full_name}
                        {!schoolClass.is_active && <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full uppercase tracking-wider font-bold">Inactive</span>}
                    </h1>
                    <p className="text-on-surface-variant mt-1">Class Dashboard</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-surface-container-low border border-outline/20 p-6 rounded-2xl flex items-center gap-4">
                    <div className="text-4xl">👨‍🏫</div>
                    <div>
                        <p className="text-sm text-on-surface-variant font-medium">Class Teacher</p>
                        <p className="text-lg font-bold text-on-surface">
                            {schoolClass.teacher ? `${schoolClass.teacher.first_name} ${schoolClass.teacher.last_name}` : 'Unassigned'}
                        </p>
                    </div>
                </div>
                
                <div className="bg-surface-container-low border border-outline/20 p-6 rounded-2xl flex items-center gap-4">
                    <div className="text-4xl">👥</div>
                    <div>
                        <p className="text-sm text-on-surface-variant font-medium">Total Students</p>
                        <p className="text-lg font-bold text-on-surface">
                            <span className="text-2xl font-black text-primary">{schoolClass.students_count || 0}</span> <span className="text-sm text-outline">/ {schoolClass.capacity}</span>
                        </p>
                    </div>
                </div>

                <div className="bg-surface-container-low border border-outline/20 p-6 rounded-2xl flex items-center gap-4">
                    <div className="text-4xl">🚪</div>
                    <div>
                        <p className="text-sm text-on-surface-variant font-medium">Room Number</p>
                        <p className="text-lg font-bold text-on-surface">
                            {schoolClass.room_number || 'Unassigned'}
                        </p>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-on-surface mb-4">Quick Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Link href={`/admin/students?class=${encodeURIComponent(schoolClass.level_name)}`} className="bg-surface-container-highest hover:bg-primary/10 border border-outline/10 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 group transition-colors">
                    <span className="text-3xl group-hover:scale-110 transition-transform">📋</span>
                    <span className="font-medium text-sm">View Students</span>
                </Link>
                <button className="bg-surface-container-highest hover:bg-primary/10 border border-outline/10 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 group transition-colors">
                    <span className="text-3xl group-hover:scale-110 transition-transform">📝</span>
                    <span className="font-medium text-sm">Exam Results</span>
                </button>
                <button className="bg-surface-container-highest hover:bg-primary/10 border border-outline/10 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 group transition-colors">
                    <span className="text-3xl group-hover:scale-110 transition-transform">📅</span>
                    <span className="font-medium text-sm">Timetable</span>
                </button>
                <button className="bg-surface-container-highest hover:bg-primary/10 border border-outline/10 p-4 rounded-xl flex flex-col items-center justify-center text-center gap-2 group transition-colors">
                    <span className="text-3xl group-hover:scale-110 transition-transform">📊</span>
                    <span className="font-medium text-sm">Attendance</span>
                </button>
            </div>
        </div>
    );
}
