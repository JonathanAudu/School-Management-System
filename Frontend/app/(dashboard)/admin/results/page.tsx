'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface AcademicSession { id: number; name: string; status?: string; is_current?: boolean; }
interface Term { id: number; name: string; academic_session_id: number; }
interface SchoolClass { id: number; level_name: string; arm_name: string; full_name: string; }

export default function ResultEntryDashboard() {
    const router = useRouter();
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [terms, setTerms] = useState<Term[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    
    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [selectedTermId, setSelectedTermId] = useState('');
    const [selectedTermType, setSelectedTermType] = useState('end_of_term');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [sessionsRes, termsRes, classesRes] = await Promise.all([
                axios.get('http://localhost:8000/api/academic-sessions', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/terms', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/school-classes', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            
            const sessionsData = sessionsRes.data.academic_sessions || sessionsRes.data;
            const termsData = termsRes.data.terms || termsRes.data;
            const classesData = classesRes.data.school_classes || classesRes.data;

            setSessions(sessionsData);
            setTerms(termsData);
            setClasses(classesData);

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

    const handleGoToEntry = () => {
        if (!selectedSessionId || !selectedTermId || !selectedTermType || !selectedClassId) {
            toast.error('Please select all fields');
            return;
        }
        router.push(`/admin/results/${selectedClassId}?session=${selectedSessionId}&term=${selectedTermId}&type=${selectedTermType}`);
    };

    const uniqueLevels = Array.from(new Set(classes.map(c => c.level_name)));
    const armsForSelectedLevel = classes.filter(c => c.level_name === selectedLevel);

    if (isLoading) return <div className="p-6 text-center text-on-surface-variant animate-pulse">Loading dashboard...</div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="bg-surface-container rounded-2xl p-8 border border-outline/20 max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-4">📝</div>
                    <h2 className="text-2xl font-bold text-on-surface">Result Entry Dashboard</h2>
                    <p className="text-on-surface-variant mt-2">Select the parameters below to open the result entry sheet for a specific class.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Academic Session *</label>
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
                            className="w-full px-4 py-3 bg-surface-container-high rounded-xl border border-outline/20 text-on-surface appearance-none focus:outline-none focus:border-primary"
                        >
                            <option value="">Select Session</option>
                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Term *</label>
                        <select 
                            value={selectedTermId} 
                            onChange={(e) => setSelectedTermId(e.target.value)}
                            className="w-full px-4 py-3 bg-surface-container-high rounded-xl border border-outline/20 text-on-surface appearance-none focus:outline-none focus:border-primary"
                        >
                            <option value="">Select Term</option>
                            {terms
                                .filter(t => t.academic_session_id === Number(selectedSessionId))
                                .map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Assessment Type *</label>
                        <select 
                            value={selectedTermType} 
                            onChange={(e) => setSelectedTermType(e.target.value)}
                            className="w-full px-4 py-3 bg-surface-container-high rounded-xl border border-outline/20 text-on-surface appearance-none focus:outline-none focus:border-primary"
                        >
                            <option value="mid_term">Mid-Term</option>
                            <option value="end_of_term">End of Term</option>
                        </select>
                    </div>
                </div>

                <div className="border-t border-outline/10 pt-8 grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Class Level *</label>
                        <select 
                            value={selectedLevel} 
                            onChange={(e) => {
                                setSelectedLevel(e.target.value);
                                setSelectedClassId('');
                            }}
                            className="w-full px-4 py-3 bg-surface-container-high rounded-xl border border-outline/20 text-on-surface appearance-none focus:outline-none focus:border-primary"
                        >
                            <option value="">Select Level</option>
                            {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-2">Class Arm *</label>
                        <select 
                            value={selectedClassId} 
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            disabled={!selectedLevel}
                            className="w-full px-4 py-3 bg-surface-container-high rounded-xl border border-outline/20 text-on-surface appearance-none focus:outline-none focus:border-primary disabled:opacity-50"
                        >
                            <option value="">Select Arm</option>
                            {armsForSelectedLevel.map(c => <option key={c.id} value={c.id}>{c.arm_name} ({c.full_name})</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button 
                        onClick={handleGoToEntry}
                        disabled={!selectedSessionId || !selectedTermId || !selectedTermType || !selectedClassId}
                        className="px-8 py-3 bg-primary text-on-primary rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                    >
                        Open Result Entry Sheet
                    </button>
                </div>
            </div>
        </div>
    );
}
