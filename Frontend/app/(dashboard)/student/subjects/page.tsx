'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

export default function StudentSubjectRegistration() {
    const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
    const [registeredSubjects, setRegisteredSubjects] = useState<any[]>([]);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
    const [session, setSession] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/student/subjects/available');
            setAvailableSubjects(res.data.available_subjects);
            setRegisteredSubjects(res.data.registered_subjects);
            setSession(res.data.session);

            const registeredIds = res.data.registered_subjects.map((rs: any) => Number(rs.subject_id));
            const compulsoryIds = res.data.available_subjects
                .filter((cs: any) => cs.is_compulsory || String(cs.is_compulsory) === "1" || String(cs.is_compulsory) === "true")
                .map((cs: any) => Number(cs.subject_id));
                
            setSelectedSubjectIds(Array.from(new Set([...registeredIds, ...compulsoryIds])));
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load subjects');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (subjectId: number) => {
        setSelectedSubjectIds(prev => 
            prev.includes(subjectId) 
                ? prev.filter(id => id !== subjectId)
                : [...prev, subjectId]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.post('/api/student/subjects/register', {
                subject_ids: selectedSubjectIds
            });
            toast.success('Subject registration submitted successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save registration');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-6 font-serif text-on-surface">Subject Registration</h1>
                <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface space-y-6 animate-pulse">
                    <div className="h-24 bg-surface-container rounded-2xl" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-24 bg-surface-container rounded-2xl" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-6 font-serif text-on-surface">Subject Registration</h1>
                <div className="bg-surface-container-low p-8 text-center rounded-3xl border border-outline/10 text-on-surface-variant font-medium">
                    No active academic session found for registration.
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-6 font-serif text-on-surface">Subject Registration</h1>
            
            <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface space-y-6">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6 pb-6 border-b border-outline/10">
                    <div>
                        <h2 className="text-xl font-bold text-on-surface mb-1">Select Subjects ({session.name})</h2>
                        <p className="text-sm text-on-surface-variant">
                            Choose the subjects you want to register for this session. Compulsory subjects are auto-registered.
                        </p>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50 whitespace-nowrap cursor-pointer"
                    >
                        {isSaving ? 'Saving...' : 'Save Registration'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableSubjects.map((cs) => {
                        const subjectIdNum = Number(cs.subject_id);
                        const isCompulsory = cs.is_compulsory || String(cs.is_compulsory) === "1" || String(cs.is_compulsory) === "true";
                        const isSelected = isCompulsory || selectedSubjectIds.includes(subjectIdNum);
                        const registration = registeredSubjects.find(rs => Number(rs.subject_id) === subjectIdNum);
                        const status = registration ? registration.status : null;

                        return (
                            <label 
                                key={cs.subject_id}
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    isSelected 
                                        ? 'border-primary bg-primary/5' 
                                        : 'border-outline/10 bg-surface-container-high hover:border-outline/30 hover:bg-surface-container-highest'
                                }`}
                            >
                                <div className="flex items-center h-5 mt-0.5">
                                    <input 
                                        type="checkbox" 
                                        className={`w-5 h-5 border-outline/30 rounded focus:ring-primary focus:ring-offset-surface-container bg-surface-container ${isCompulsory ? 'text-primary/50 cursor-not-allowed' : 'text-primary'}`}
                                        checked={isSelected}
                                        disabled={isCompulsory}
                                        onChange={() => !isCompulsory && handleToggle(subjectIdNum)}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-on-surface">
                                        {cs.subject?.name}
                                    </div>
                                    <div className="flex gap-2 mt-1">
                                        <div className="text-xs text-on-surface-variant font-mono bg-surface-container-highest inline-block px-1.5 py-0.5 rounded">
                                            {cs.subject?.code}
                                        </div>
                                        {isCompulsory ? (
                                            <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-red-500/10 text-red-600">Compulsory</div>
                                        ) : (
                                            <div className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600">Elective</div>
                                        )}
                                    </div>
                                    {status && (
                                        <div className="mt-2">
                                            {status === 'pending' && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-600">Pending</span>}
                                            {status === 'approved' && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-green-500/20 text-green-600">Approved</span>}
                                            {status === 'rejected' && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-600">Rejected</span>}
                                        </div>
                                    )}
                                </div>
                            </label>
                        );
                    })}

                    {availableSubjects.length === 0 && (
                        <div className="col-span-full py-8 text-center text-on-surface-variant border-2 border-dashed border-outline/20 rounded-xl">
                            No subjects have been assigned to your class level yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
