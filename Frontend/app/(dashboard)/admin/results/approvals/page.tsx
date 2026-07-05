'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface AcademicSession { id: number; name: string; status?: string; is_current?: boolean; }
interface Term { id: number; name: string; academic_session_id: number; }
interface ResultApproval { id: number; form_teacher_status: string; admin_status: string; }
interface SchoolClass { id: number; level_name: string; arm_name: string; full_name: string; approval?: ResultApproval; }

export default function ResultApprovalsPage() {
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [terms, setTerms] = useState<Term[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [selectedTermId, setSelectedTermId] = useState('');
    const [selectedTermType, setSelectedTermType] = useState('end_of_term');
    const [isLoading, setIsLoading] = useState(true);
    const [isFetchingClasses, setIsFetchingClasses] = useState(false);

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedSessionId && selectedTermId && selectedTermType) {
            fetchClasses();
        }
    }, [selectedSessionId, selectedTermId, selectedTermType]);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [sessionsRes, termsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/academic-sessions', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/terms', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            
            const sessionsData = sessionsRes.data.academic_sessions || sessionsRes.data;
            const termsData = termsRes.data.terms || termsRes.data;

            setSessions(sessionsData);
            setTerms(termsData);

            const currentSession = sessionsData.find((s: any) => s.status === 'active') || sessionsData[0];
            if (currentSession) {
                setSelectedSessionId(currentSession.id.toString());
                const matchingTerm = termsData.find((t: any) => t.academic_session_id === currentSession.id);
                if (matchingTerm) {
                    setSelectedTermId(matchingTerm.id.toString());
                } else if (termsData.length > 0) {
                    setSelectedTermId(termsData[0].id.toString());
                }
            } else if (termsData.length > 0) {
                setSelectedTermId(termsData[0].id.toString());
            }
        } catch (error) {
            toast.error('Failed to load initial data');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchClasses = async () => {
        setIsFetchingClasses(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8000/api/result-approvals', {
                params: {
                    academic_session_id: selectedSessionId,
                    term_id: selectedTermId,
                    term_type: selectedTermType
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setClasses(res.data);
        } catch (error) {
            toast.error('Failed to load class approvals');
        } finally {
            setIsFetchingClasses(false);
        }
    };

    const handleUpdateStatus = async (classId: number, role: 'form_teacher' | 'admin', status: 'approved' | 'rejected' | 'pending') => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/result-approvals/status', {
                academic_session_id: selectedSessionId,
                term_id: selectedTermId,
                term_type: selectedTermType,
                school_class_id: classId,
                role,
                status
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`${role === 'admin' ? 'Admin' : 'Form Teacher'} status updated`);
            fetchClasses();
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const StatusBadge = ({ status }: { status?: string }) => {
        if (!status || status === 'pending') return <span className="px-2 py-1 text-xs font-semibold rounded bg-yellow-500/20 text-yellow-600">Pending</span>;
        if (status === 'approved') return <span className="px-2 py-1 text-xs font-semibold rounded bg-green-500/20 text-green-600">Approved</span>;
        if (status === 'rejected') return <span className="px-2 py-1 text-xs font-semibold rounded bg-red-500/20 text-red-600">Rejected</span>;
        return null;
    };

    if (isLoading) return <div className="p-6 text-center text-on-surface-variant animate-pulse">Loading...</div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="bg-surface-container rounded-2xl p-6 border border-outline/20">
                <h2 className="text-xl font-bold text-on-surface mb-6">Result Approvals Workflow</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Academic Session</label>
                        <select 
                            value={selectedSessionId} 
                            onChange={(e) => {
                                const sessionId = e.target.value;
                                setSelectedSessionId(sessionId);
                                const matchingTerm = terms.find(t => t.academic_session_id === Number(sessionId));
                                if (matchingTerm) {
                                    setSelectedTermId(matchingTerm.id.toString());
                                } else {
                                    setSelectedTermId('');
                                }
                            }}
                            className="w-full px-4 py-2.5 bg-surface-container-high rounded-xl border border-outline/20 text-on-surface focus:outline-none focus:border-primary"
                        >
                            <option value="">Select Session</option>
                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Term</label>
                        <select 
                            value={selectedTermId} 
                            onChange={(e) => setSelectedTermId(e.target.value)}
                            className="w-full px-4 py-2.5 bg-surface-container-high rounded-xl border border-outline/20 text-on-surface focus:outline-none focus:border-primary"
                        >
                            <option value="">Select Term</option>
                            {terms
                                .filter(t => t.academic_session_id === Number(selectedSessionId))
                                .map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Assessment Type</label>
                        <select 
                            value={selectedTermType} 
                            onChange={(e) => setSelectedTermType(e.target.value)}
                            className="w-full px-4 py-2.5 bg-surface-container-high rounded-xl border border-outline/20 text-on-surface focus:outline-none focus:border-primary"
                        >
                            <option value="mid_term">Mid-Term</option>
                            <option value="end_of_term">End of Term</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-surface-container rounded-2xl border border-outline/20 overflow-hidden">
                <div className="p-4 bg-surface-container-high border-b border-outline/20">
                    <h3 className="font-semibold text-on-surface">Class Approval Status</h3>
                </div>
                
                {isFetchingClasses ? (
                    <div className="p-8 text-center text-on-surface-variant animate-pulse">Fetching statuses...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface-container-highest/30 text-on-surface-variant">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Class Name</th>
                                    <th className="px-6 py-3 font-medium">Form Teacher Status</th>
                                    <th className="px-6 py-3 font-medium">Admin Status</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions (Admin View)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline/10">
                                {classes.map(cls => (
                                    <tr key={cls.id} className="hover:bg-surface-container-high/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-on-surface">
                                            <div className="flex items-center justify-between">
                                                <span>{cls.full_name}</span>
                                                <Link 
                                                    href={`/admin/results/${cls.id}?session=${selectedSessionId}&term=${selectedTermId}&type=${selectedTermType}`}
                                                    className="ml-4 px-2.5 py-1 text-xs bg-primary/10 text-primary hover:bg-primary/20 rounded-md font-semibold transition-colors"
                                                >
                                                    👁️ View Scores
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={cls.approval?.form_teacher_status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={cls.approval?.admin_status} />
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            {cls.approval?.admin_status === 'approved' ? (
                                                <button
                                                    onClick={() => handleUpdateStatus(cls.id, 'admin', 'pending')}
                                                    className="px-3 py-1.5 text-xs font-medium bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border border-yellow-500/25 rounded-lg transition-colors"
                                                >
                                                    Revoke/Unapprove
                                                </button>
                                            ) : (
                                                <div className="inline-flex rounded-md shadow-sm" role="group">
                                                    <button
                                                        onClick={() => handleUpdateStatus(cls.id, 'admin', 'approved')}
                                                        className="px-3 py-1.5 text-xs font-medium bg-green-500/10 text-green-600 hover:bg-green-500/20 border border-green-500/20 rounded-l-lg transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(cls.id, 'admin', 'rejected')}
                                                        className="px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-600 hover:bg-red-500/20 border-y border-r border-red-500/20 rounded-r-lg transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
