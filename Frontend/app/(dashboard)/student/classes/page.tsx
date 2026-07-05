'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

interface ClassData {
    level_name: string;
    arm_name: string;
    full_name: string;
    teacher_name: string;
}

interface SubjectData {
    id: number;
    subject_id: number;
    name: string;
    code: string;
    category: string;
    teacher_name: string;
    teacher_email: string;
    is_compulsory: boolean;
    is_registered: boolean;
}

export default function StudentClassesPage() {
    const [classInfo, setClassInfo] = useState<ClassData | null>(null);
    const [subjects, setSubjects] = useState<SubjectData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchClassDetails();
    }, []);

    const fetchClassDetails = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/student/class');
            setClassInfo(res.data.class);
            setSubjects(res.data.subjects);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load class details');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-6 font-serif text-on-surface">My Class</h1>
                <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-outline/10">
                        <div className="space-y-2 flex-1">
                            <div className="h-8 bg-surface-container rounded-lg w-1/3 animate-pulse" />
                            <div className="h-4 bg-surface-container rounded-lg w-2/3 animate-pulse" />
                        </div>
                        <div className="h-16 bg-surface-container rounded-2xl w-64 animate-pulse" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="h-44 bg-surface-container rounded-2xl animate-pulse border border-outline/10" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!classInfo) {
        return (
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-6 font-serif text-on-surface">My Class</h1>
                <div className="bg-surface-container-low p-8 text-center rounded-3xl border border-outline/10 text-on-surface-variant font-medium">
                    Class information could not be retrieved.
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-6 font-serif text-on-surface">My Class</h1>
            
            <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface space-y-8">
                {/* Class Overview Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-outline/10">
                    <div>
                        <h2 className="text-2xl font-bold text-on-surface">{classInfo.full_name}</h2>
                        <p className="text-sm text-on-surface-variant mt-1">Check your assigned subjects and teachers for the current session.</p>
                    </div>
                    
                    {/* Teacher Profile Widget */}
                    <div className="flex items-center gap-4 bg-surface-container-highest/40 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-outline/10 min-w-[250px] shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                            {classInfo.teacher_name.charAt(0)}
                        </div>
                        <div>
                            <span className="block text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Form Teacher</span>
                            <span className="block text-sm font-bold text-on-surface">{classInfo.teacher_name}</span>
                        </div>
                    </div>
                </div>

                {/* Subjects Offered */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-outline/10 pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-on-surface">Class Subjects Offered</h2>
                            <p className="text-xs text-on-surface-variant">Manage and check your registered class subjects</p>
                        </div>
                        <span className="bg-surface-container px-3 py-1 rounded-full text-xs font-bold text-primary border border-outline/10">
                            {subjects.length} Subjects
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subjects.map((sub) => (
                            <div 
                                key={sub.id} 
                                className="bg-surface-container hover:bg-surface-container-high border border-outline/10 hover:border-primary/20 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md relative overflow-hidden group"
                            >
                                {/* Accent line on hover */}
                                <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                                <div>
                                    <div className="flex justify-between items-start gap-4 mb-3">
                                        <div className="space-y-1">
                                            <h3 className="font-bold text-on-surface text-base group-hover:text-primary transition-colors line-clamp-1">{sub.name}</h3>
                                            <div className="flex gap-2">
                                                <span className="text-[10px] font-mono font-bold bg-surface-container-highest px-2 py-0.5 rounded text-on-surface-variant border border-outline/5">{sub.code}</span>
                                                <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{sub.category}</span>
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            {sub.is_compulsory ? (
                                                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-red-500/10 text-red-600 px-2 py-0.5 rounded border border-red-500/15">Compulsory</span>
                                            ) : (
                                                <span className="text-[9px] font-extrabold uppercase tracking-wider bg-blue-500/10 text-blue-600 px-2 py-0.5 rounded border border-blue-500/15">Elective</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-outline/5 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface flex items-center justify-center font-bold text-xs">
                                            {sub.teacher_name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="block text-[9px] uppercase tracking-wider text-on-surface-variant">Subject Teacher</span>
                                            <span className="block text-xs font-bold text-on-surface truncate">{sub.teacher_name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-t border-outline/5 flex justify-between items-center">
                                    <span className="text-[10px] text-on-surface-variant font-medium">Status</span>
                                    {sub.is_registered ? (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-600 border border-green-500/15">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            Registered
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-600 border border-yellow-500/15">
                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                                            Not Registered
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}

                        {subjects.length === 0 && (
                            <div className="col-span-full py-16 text-center text-on-surface-variant border-2 border-dashed border-outline/10 rounded-2xl">
                                <span className="text-3xl block mb-2">📭</span>
                                <p className="font-medium text-sm">No subjects have been assigned to your class level for the current session.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
