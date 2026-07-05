'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

export default function SubjectRegistrationApprovals() {
    const [lookups, setLookups] = useState<{ sessions: any[], classes: any[] }>({ sessions: [], classes: [] });
    const [filterSession, setFilterSession] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [filterArm, setFilterArm] = useState('');
    const [students, setStudents] = useState<any[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

    useEffect(() => {
        fetchLookups();
    }, []);

    const fetchLookups = async () => {
        try {
            const res = await axios.get('/api/lookups');
            setLookups(res.data);
            if (res.data.sessions.length > 0) {
                const active = res.data.sessions.find((s: any) => s.status === 'active') || res.data.sessions[0];
                setFilterSession(active.id.toString());
            }
        } catch (error) {
            toast.error('Failed to load classes and sessions');
        }
    };

    const fetchStudents = async () => {
        if (!filterSession || !filterClass || !filterArm) return;
        setIsLoading(true);
        try {
            const res = await axios.get('/api/student-subjects/approvals', {
                params: {
                    academic_session_id: filterSession,
                    class: filterClass,
                    arm: filterArm,
                    page: currentPage,
                    search: searchQuery
                }
            });
            setStudents(res.data.data);
            setCurrentPage(res.data.current_page);
            setLastPage(res.data.last_page);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch approvals');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            if (filterSession && filterClass && filterArm) {
                fetchStudents();
            } else {
                setStudents([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [filterSession, filterClass, filterArm, currentPage, searchQuery]);

    const handleUpdateStatus = async (studentId: number, subjectId: number, newStatus: string) => {
        try {
            await axios.post('/api/student-subjects/approve', {
                student_id: studentId,
                subject_id: subjectId,
                academic_session_id: filterSession,
                status: newStatus
            });
            
            // Update local state
            setStudents(prev => prev.map(student => {
                if (student.id === studentId) {
                    return {
                        ...student,
                        registered_subjects: student.registered_subjects.map((rs: any) => {
                            if (rs.id === subjectId) {
                                return { ...rs, pivot: { ...rs.pivot, status: newStatus } };
                            }
                            return rs;
                        })
                    };
                }
                return student;
            }));
            
            toast.success('Status updated');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const uniqueClasses = Array.from(new Set(lookups.classes.map(c => c.level_name)));
    const armsForClass = lookups.classes.filter(c => c.level_name === filterClass).map(c => c.arm_name);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Subject Registration Approvals</h1>
                    <p className="text-on-surface-variant">Review and approve subjects selected by students.</p>
                </div>
                <div className="w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Search students..." 
                        value={searchQuery}
                        onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
            </div>

            <div className="bg-surface-container rounded-2xl p-6 border border-outline/20 flex gap-4">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-on-surface mb-1">Session</label>
                    <select 
                        value={filterSession} 
                        onChange={e => setFilterSession(e.target.value)} 
                        className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Select...</option>
                        {lookups.sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-on-surface mb-1">Class Level</label>
                    <select 
                        value={filterClass} 
                        onChange={e => {
                            setFilterClass(e.target.value);
                            setFilterArm('');
                        }} 
                        className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">Select Class...</option>
                        {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-on-surface mb-1">Class Arm</label>
                    <select 
                        value={filterArm} 
                        onChange={e => setFilterArm(e.target.value)} 
                        disabled={!filterClass}
                        className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
                    >
                        <option value="">Select Arm...</option>
                        {armsForClass.map(arm => <option key={arm} value={arm}>{arm}</option>)}
                    </select>
                </div>
            </div>

            {isLoading && <div className="p-8 text-center animate-pulse">Loading students...</div>}

            {!isLoading && students.length > 0 && (
                <div className="grid grid-cols-1 gap-6">
                    {students.map(student => (
                        <div key={student.id} className="bg-surface-container rounded-2xl border border-outline/20 overflow-hidden">
                            <div 
                                className="p-4 border-b border-outline/10 bg-surface-container-highest flex justify-between items-center cursor-pointer hover:bg-surface-container-high transition-colors"
                                onClick={() => setExpandedStudentId(expandedStudentId === student.id ? null : student.id)}
                            >
                                <div>
                                    <h3 className="font-bold text-lg text-on-surface">{student.first_name} {student.last_name}</h3>
                                    <p className="text-sm text-on-surface-variant">Admission No: {student.admission_number}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-sm font-medium px-3 py-1 bg-primary/10 text-primary rounded-full">
                                        {student.registered_subjects?.length || 0} Subjects
                                    </div>
                                    <span className="text-xl text-on-surface-variant">{expandedStudentId === student.id ? '↑' : '↓'}</span>
                                </div>
                            </div>
                            
                            {expandedStudentId === student.id && (
                                <div className="p-4">
                                    {student.registered_subjects?.length > 0 ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {student.registered_subjects.map((subject: any) => {
                                                const status = subject.pivot.status;
                                                return (
                                                    <div key={subject.id} className="p-3 rounded-lg border border-outline/10 flex flex-col justify-between h-full bg-surface-container-low">
                                                        <div>
                                                            <div className="font-semibold text-sm">{subject.name}</div>
                                                            <div className="text-xs text-on-surface-variant mb-3">{subject.code}</div>
                                                        </div>
                                                        <div className="flex gap-2 text-xs">
                                                            <button 
                                                                disabled={status === 'approved'}
                                                                onClick={() => handleUpdateStatus(student.id, subject.id, 'approved')}
                                                                className={`flex-1 py-1.5 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${status === 'approved' ? 'bg-green-500 text-white' : 'bg-green-500/10 text-green-600 hover:bg-green-500/20'}`}
                                                            >
                                                                {status === 'approved' ? 'Approved ✓' : 'Approve'}
                                                            </button>
                                                            <button 
                                                                disabled={status === 'rejected'}
                                                                onClick={() => handleUpdateStatus(student.id, subject.id, 'rejected')}
                                                                className={`flex-1 py-1.5 rounded font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${status === 'rejected' ? 'bg-red-500 text-white' : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'}`}
                                                            >
                                                                {status === 'rejected' ? 'Rejected ✗' : 'Reject'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 text-on-surface-variant text-sm">
                                            No subjects selected yet.
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            
            {!isLoading && students.length > 0 && lastPage > 1 && (
                <div className="flex justify-between items-center mt-6 p-4 bg-surface-container rounded-xl border border-outline/20">
                    <button 
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-4 py-2 bg-surface-container-high rounded font-medium disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <span className="text-on-surface-variant font-medium">Page {currentPage} of {lastPage}</span>
                    <button 
                        disabled={currentPage === lastPage}
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-4 py-2 bg-surface-container-high rounded font-medium disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            )}
            
            {!isLoading && filterSession && filterClass && filterArm && students.length === 0 && (
                <div className="p-12 text-center border border-outline/20 border-dashed rounded-2xl text-on-surface-variant">
                    No students found in this class.
                </div>
            )}
        </div>
    );
}
