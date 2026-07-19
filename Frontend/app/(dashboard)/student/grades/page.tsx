'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

interface Session {
    id: number;
    name: string;
}

interface Term {
    id: number;
    name: string;
    academic_session_id: number;
}

interface GradeResult {
    id: number;
    subject_name: string;
    subject_code: string;
    category: string;
    ca1: string | null;
    ca2: string | null;
    exam: string | null;
    total_score: string | null;
    grade: string | null;
    remark: string | null;
}

interface Summary {
    total_score: number;
    average_score: number;
    subjects_count: number;
    class_rank: string;
    class_size: number;
}

interface ClassInfo {
    id: number;
    full_name: string;
}

export default function StudentGradesPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [terms, setTerms] = useState<Term[]>([]);
    const [filteredTerms, setFilteredTerms] = useState<Term[]>([]);
    
    const [selectedSessionId, setSelectedSessionId] = useState<string>('');
    const [selectedTermId, setSelectedTermId] = useState<string>('');
    const [selectedTermType, setSelectedTermType] = useState<string>('end_of_term');

    const [studentId, setStudentId] = useState<number | null>(null);
    const [classInfo, setClassInfo] = useState<ClassInfo | null>(null);
    const [enrolled, setEnrolled] = useState(false);
    const [released, setReleased] = useState(false);
    const [results, setResults] = useState<GradeResult[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);

    // Initial load: fetch options and initial grades
    useEffect(() => {
        loadGrades(true);
    }, []);

    // Filter terms based on selected session
    useEffect(() => {
        if (selectedSessionId) {
            const sessId = Number(selectedSessionId);
            const matches = terms.filter(t => !t.academic_session_id || Number(t.academic_session_id) === sessId);
            setFilteredTerms(matches);
            
            if (matches.length > 0 && !matches.find(m => String(m.id) === selectedTermId)) {
                setSelectedTermId(String(matches[0].id));
            }
        } else {
            setFilteredTerms(terms);
        }
    }, [selectedSessionId, terms]);

    // Handle filter changes (only after initial load has populated lookup lists)
    useEffect(() => {
        if (sessions.length > 0 && selectedSessionId && selectedTermId) {
            loadGrades(false);
        }
    }, [selectedSessionId, selectedTermId, selectedTermType]);

    const loadGrades = async (isInitial: boolean) => {
        if (isInitial) setIsLoading(true);
        try {
            const params: any = {};
            if (!isInitial) {
                if (selectedSessionId) params.academic_session_id = selectedSessionId;
                if (selectedTermId) params.term_id = selectedTermId;
                params.term_type = selectedTermType;
            }

            const res = await axios.get('/api/student/grades', { params });
            
            setStudentId(res.data.student_id);
            setEnrolled(res.data.enrolled);
            setReleased(res.data.released);
            setResults(res.data.results);
            setSummary(res.data.summary);
            setClassInfo(res.data.class);

            if (isInitial) {
                setSessions(res.data.sessions);
                setTerms(res.data.terms);
                
                const defaultSessId = res.data.default_session_id || (res.data.sessions.find((s: any) => s.status === 'active')?.id) || res.data.sessions[0]?.id;
                const defaultTermId = res.data.default_term_id || (res.data.terms.find((t: any) => t.is_current || String(t.is_current) === "1" || String(t.is_current) === "true")?.id) || res.data.terms[0]?.id;
                
                if (defaultSessId) setSelectedSessionId(String(defaultSessId));
                if (defaultTermId) setSelectedTermId(String(defaultTermId));
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to load grades data');
        } finally {
            if (isInitial) setIsLoading(false);
        }
    };

    const handleDownloadPdf = async () => {
        if (!studentId || !classInfo) return;
        setIsDownloading(true);
        try {
            const response = await axios.get(`/api/report-card/${studentId}`, {
                params: {
                    academic_session_id: selectedSessionId,
                    term_id: selectedTermId,
                    term_type: selectedTermType,
                    school_class_id: classInfo.id,
                },
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            const termName = terms.find(t => String(t.id) === selectedTermId)?.name || 'Term';
            const sessionName = sessions.find(s => String(s.id) === selectedSessionId)?.name || 'Session';
            const formattedFileName = `ReportCard_${classInfo.full_name.replace(/\s+/g, '_')}_${sessionName.replace(/\//g, '-')}_${termName.replace(/\s+/g, '_')}_${selectedTermType}.pdf`;
            
            link.setAttribute('download', formattedFileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
            toast.success('Report card downloaded successfully');
        } catch (error: any) {
            console.error('Download error:', error);
            toast.error('Failed to download report card PDF');
        } finally {
            setIsDownloading(false);
        }
    };

    const getGradeBadgeClass = (grade: string | null) => {
        if (!grade) return 'bg-outline/10 text-on-surface-variant';
        const g = grade.toUpperCase();
        if (g.startsWith('A')) return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
        if (g.startsWith('B')) return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
        if (g.startsWith('C')) return 'bg-blue-500/10 text-blue-600 border border-blue-500/20';
        if (g.startsWith('D')) return 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20';
        if (g.startsWith('E')) return 'bg-orange-500/10 text-orange-600 border border-orange-500/20';
        if (g.startsWith('F')) return 'bg-red-500/10 text-red-600 border border-red-500/20';
        return 'bg-outline/10 text-on-surface-variant border border-outline/20';
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-6 py-12">
                <h1 className="text-3xl font-bold mb-6 font-serif text-on-surface">My Grades</h1>
                <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface space-y-6">
                    <div className="h-24 bg-surface-container rounded-2xl animate-pulse" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-24 bg-surface-container rounded-2xl border border-outline/10 animate-pulse" />
                        ))}
                    </div>
                    <div className="h-96 bg-surface-container rounded-2xl border border-outline/10 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-12">
            <h1 className="text-3xl font-bold mb-6 font-serif text-on-surface">My Grades</h1>
            
            <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface space-y-6">
                
                {/* Filter controls card */}
                <div className="bg-surface-container border border-outline/10 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                        {/* Session Selector */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Academic Session</label>
                            <select 
                                value={selectedSessionId}
                                onChange={(e) => setSelectedSessionId(e.target.value)}
                                className="w-full bg-surface-container-high border border-outline/10 focus:border-primary rounded-xl text-sm px-3.5 py-2.5 text-on-surface focus:outline-none transition-all cursor-pointer"
                            >
                                {sessions.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Term Selector */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Academic Term</label>
                            <select 
                                value={selectedTermId}
                                onChange={(e) => setSelectedTermId(e.target.value)}
                                className="w-full bg-surface-container-high border border-outline/10 focus:border-primary rounded-xl text-sm px-3.5 py-2.5 text-on-surface focus:outline-none transition-all cursor-pointer"
                            >
                                {filteredTerms.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                                {filteredTerms.length === 0 && (
                                    <option value="">No terms available</option>
                                )}
                            </select>
                        </div>

                        {/* Term Type Selector */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Report Type</label>
                            <select 
                                value={selectedTermType}
                                onChange={(e) => setSelectedTermType(e.target.value)}
                                className="w-full bg-surface-container-high border border-outline/10 focus:border-primary rounded-xl text-sm px-3.5 py-2.5 text-on-surface focus:outline-none transition-all cursor-pointer"
                            >
                                <option value="end_of_term">End of Term Report</option>
                                <option value="mid_term">Mid-Term Report</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Output Block */}
                {!enrolled ? (
                    /* Not Enrolled in Session Warning */
                    <div className="bg-surface-container border border-outline/10 text-center py-16 px-6 rounded-2xl shadow-sm">
                        <span className="text-4xl block mb-3">⚠️</span>
                        <h3 className="font-bold text-lg text-on-surface">No Enrollment Record Found</h3>
                        <p className="text-sm text-on-surface-variant mt-2 max-w-md mx-auto">
                            You do not appear to have been enrolled in any class arm for the selected academic session. Please contact the administration if you believe this is an error.
                        </p>
                    </div>
                ) : !released ? (
                    /* Results Not Released Lock State */
                    <div className="bg-surface-container border border-outline/10 text-center py-16 px-6 rounded-2xl shadow-sm flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-yellow-500/10 text-yellow-600 border border-yellow-500/15 flex items-center justify-center text-3xl mb-4 animate-bounce">
                            🔒
                        </div>
                        <h3 className="font-bold text-lg text-on-surface">Results Processing</h3>
                        <p className="text-sm text-on-surface-variant mt-2 max-w-lg">
                            The academic results for <strong className="text-on-surface font-semibold">{classInfo?.full_name}</strong> in the selected term have not yet been approved and officially released. Please check back later.
                        </p>
                    </div>
                ) : (
                    /* Results Released Live Screen */
                    <div className="space-y-6 animate-fadeIn">
                        {/* Summary Metrics Cards */}
                        {summary && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {/* Class Rank Card */}
                                <div className="bg-surface-container border border-outline/10 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Class Placement</span>
                                    <div className="mt-2 flex items-baseline gap-1">
                                        <span className="text-2xl font-extrabold text-primary">{summary.class_rank}</span>
                                        <span className="text-xs text-on-surface-variant">/ {summary.class_size}</span>
                                    </div>
                                </div>
                                
                                {/* Averages Card */}
                                <div className="bg-surface-container border border-outline/10 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Overall Average</span>
                                    <div className="mt-2">
                                        <span className="text-2xl font-extrabold text-on-surface">{summary.average_score}%</span>
                                    </div>
                                </div>

                                {/* Total Marks Card */}
                                <div className="bg-surface-container border border-outline/10 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Cumulative Score</span>
                                    <div className="mt-2">
                                        <span className="text-2xl font-extrabold text-on-surface">{summary.total_score}</span>
                                    </div>
                                </div>

                                {/* Subject Count Card */}
                                <div className="bg-surface-container border border-outline/10 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                                    <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">Subjects Graded</span>
                                    <div className="mt-2">
                                        <span className="text-2xl font-extrabold text-on-surface">{summary.subjects_count}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Table and Actions Container */}
                        <div className="bg-surface-container border border-outline/10 rounded-2xl overflow-hidden shadow-sm">
                            <div className="p-6 border-b border-outline/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-lg text-on-surface">Subject-wise Grades Breakdown</h3>
                                    <p className="text-xs text-on-surface-variant mt-0.5">Results released for {classInfo?.full_name}</p>
                                </div>
                                <button
                                    onClick={handleDownloadPdf}
                                    disabled={isDownloading || results.length === 0}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/95 disabled:opacity-50 text-on-primary font-bold text-sm rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                                >
                                    {isDownloading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Generating PDF...
                                        </>
                                    ) : (
                                        <>
                                            <span>📥</span>
                                            Download PDF Report Card
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline/10">
                                            <th className="py-4 px-6">Subject</th>
                                            <th className="py-4 px-6 text-center">CA 1 (20%)</th>
                                            <th className="py-4 px-6 text-center">CA 2 (20%)</th>
                                            <th className="py-4 px-6 text-center">Exam (60%)</th>
                                            <th className="py-4 px-6 text-center">Total (100%)</th>
                                            <th className="py-4 px-6 text-center">Grade</th>
                                            <th className="py-4 px-6">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline/10 text-sm text-on-surface">
                                        {results.map((res) => (
                                            <tr key={res.id} className="hover:bg-surface-container-high transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold">{res.subject_name}</div>
                                                    <div className="text-xs text-on-surface-variant mt-0.5 font-mono">{res.subject_code} &bull; {res.category}</div>
                                                </td>
                                                <td className="py-4 px-6 text-center font-semibold text-on-surface-variant">{res.ca1 ?? '-'}</td>
                                                <td className="py-4 px-6 text-center font-semibold text-on-surface-variant">{res.ca2 ?? '-'}</td>
                                                <td className="py-4 px-6 text-center font-semibold text-on-surface-variant">{res.exam ?? '-'}</td>
                                                <td className="py-4 px-6 text-center font-extrabold text-primary">{res.total_score ?? '-'}</td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-block px-3 py-1 text-xs font-extrabold rounded-full ${getGradeBadgeClass(res.grade)}`}>
                                                        {res.grade ?? '-'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 font-semibold text-on-surface-variant">{res.remark ?? '-'}</td>
                                            </tr>
                                        ))}

                                        {results.length === 0 && (
                                            <tr>
                                                <td colSpan={7} className="py-12 text-center text-on-surface-variant">
                                                    No individual subject marks found for this report card.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
