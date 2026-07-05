'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface AcademicSession { id: number; name: string; status?: string; is_current?: boolean; }
interface Term { id: number; name: string; is_current: boolean; academic_session_id: number; }
interface SchoolClass { id: number; level_name: string; arm_name: string; full_name: string; }

interface GradeDistribution {
    grade: string;
    count: number;
}

interface SubjectPerformance {
    id: number;
    name: string;
    code: string;
    average: number;
    high: number;
    low: number;
    pass_rate: number;
}

interface LeaderboardEntry {
    rank: number | string;
    student_id: number;
    name: string;
    admission_number: string;
    total_score: number;
    average_score: number;
    subjects_count: number;
}

interface PerformanceData {
    class: {
        id: number;
        full_name: string;
        level_name: string;
        arm_name: string;
    };
    summary: {
        class_average: number;
        high_score: number;
        low_score: number;
        pass_rate: number;
        total_students: number;
        graded_count: number;
    };
    grade_distribution: GradeDistribution[];
    subject_performance: SubjectPerformance[];
    leaderboard: LeaderboardEntry[];
}

export default function PerformanceOverviewPage() {
    const [lookups, setLookups] = useState<{ sessions: AcademicSession[]; terms: Term[]; classes: SchoolClass[] }>({
        sessions: [],
        terms: [],
        classes: []
    });

    const [filterSession, setFilterSession] = useState('');
    const [filterTerm, setFilterTerm] = useState('');
    const [filterTermType, setFilterTermType] = useState('end_of_term');
    const [filterClassLevel, setFilterClassLevel] = useState('');
    const [filterClassId, setFilterClassId] = useState('');

    const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchLookups();
    }, []);

    const fetchLookups = async () => {
        try {
            const res = await axios.get('/api/lookups');
            setLookups(res.data);

            if (res.data.sessions.length > 0) {
                const activeSession = res.data.sessions.find((s: AcademicSession) => s.status === 'active') || res.data.sessions[0];
                setFilterSession(activeSession.id.toString());
            }
            if (res.data.terms.length > 0) {
                const activeTerm = res.data.terms.find((t: Term) => t.is_current) || res.data.terms[0];
                setFilterTerm(activeTerm.id.toString());
            }
        } catch (error) {
            toast.error('Failed to load classes, sessions, and terms');
        }
    };

    const fetchPerformance = async () => {
        if (!filterSession || !filterTerm || !filterTermType || !filterClassId) {
            toast.error('Please select all filters');
            return;
        }

        setIsSearching(true);
        setIsLoading(true);
        try {
            const res = await axios.get('/api/results/performance', {
                params: {
                    academic_session_id: filterSession,
                    term_id: filterTerm,
                    term_type: filterTermType,
                    school_class_id: filterClassId
                }
            });
            setPerformanceData(res.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch performance analytics');
            setPerformanceData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const uniqueClasses = Array.from(new Set(lookups.classes.map(c => c.level_name)));
    const armsForClass = lookups.classes.filter(c => c.level_name === filterClassLevel);

    // Color mapping for grade distribution bars
    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#6B7280'];

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-on-surface">Class Performance Overview</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                    Analyze class statistics, grade distributions, subject averages, and student leaderboard.
                </p>
            </div>

            {/* Filter Panel */}
            <div className="bg-surface-container rounded-2xl p-6 border border-outline/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Session</label>
                        <select 
                            value={filterSession} 
                            onChange={e => {
                                const sessId = e.target.value;
                                setFilterSession(sessId);
                                const matchingTerm = lookups.terms.find((t: any) => t.academic_session_id === Number(sessId));
                                if (matchingTerm) {
                                    setFilterTerm(matchingTerm.id.toString());
                                } else {
                                    setFilterTerm('');
                                }
                            }}
                            className="w-full px-4 py-2.5 border border-outline/20 rounded-xl bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                        >
                            <option value="">Select Session</option>
                            {lookups.sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Term</label>
                        <select 
                            value={filterTerm} 
                            onChange={e => setFilterTerm(e.target.value)} 
                            className="w-full px-4 py-2.5 border border-outline/20 rounded-xl bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                        >
                            <option value="">Select Term</option>
                            {lookups.terms
                                .filter((t: any) => !filterSession || t.academic_session_id === Number(filterSession))
                                .map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Assessment Type</label>
                        <select 
                            value={filterTermType} 
                            onChange={e => setFilterTermType(e.target.value)} 
                            className="w-full px-4 py-2.5 border border-outline/20 rounded-xl bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                        >
                            <option value="mid_term">Mid-Term</option>
                            <option value="end_of_term">End of Term</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Class Level</label>
                        <select 
                            value={filterClassLevel} 
                            onChange={e => {
                                setFilterClassLevel(e.target.value);
                                setFilterClassId('');
                            }} 
                            className="w-full px-4 py-2.5 border border-outline/20 rounded-xl bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                        >
                            <option value="">Select Level</option>
                            {uniqueClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Class Arm</label>
                            <select 
                                value={filterClassId} 
                                onChange={e => setFilterClassId(e.target.value)} 
                                disabled={!filterClassLevel}
                                className="w-full px-4 py-2.5 border border-outline/20 rounded-xl bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 text-sm font-medium"
                            >
                                <option value="">Select Arm</option>
                                {armsForClass.map(c => <option key={c.id} value={c.id}>{c.arm_name} ({c.full_name})</option>)}
                            </select>
                        </div>
                        <button
                            onClick={fetchPerformance}
                            disabled={!filterSession || !filterTerm || !filterClassId || isLoading}
                            className="px-6 py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm shrink-0 flex items-center gap-2"
                        >
                            {isLoading ? 'Loading...' : 'Analyze'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Dashboard Content */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-on-surface-variant font-medium animate-pulse">Gathering academic records...</p>
                </div>
            )}

            {!isLoading && !performanceData && isSearching && (
                <div className="p-12 text-center border border-outline/20 border-dashed rounded-2xl text-on-surface-variant">
                    No results found for the selected parameters. Make sure results have been entered for this class.
                </div>
            )}

            {!isLoading && !isSearching && (
                <div className="p-12 text-center border border-outline/20 border-dashed rounded-2xl text-on-surface-variant max-w-2xl mx-auto mt-6">
                    <span className="text-5xl block mb-4">📊</span>
                    <h3 className="text-lg font-bold text-on-surface mb-2">Select Parameters to Analyze</h3>
                    <p className="text-sm">Select an academic session, term, assessment type, and class to generate a full performance breakdown.</p>
                </div>
            )}

            {!isLoading && performanceData && (
                <div className="space-y-6">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Class Average */}
                        <div className="bg-surface-container rounded-2xl p-6 border border-outline/20 flex items-center justify-between shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 text-9xl pointer-events-none">📈</div>
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Class Average</span>
                                <span className="text-4xl font-black text-on-surface tracking-tight block">
                                    {performanceData.summary.class_average}%
                                </span>
                                <span className="text-xs text-on-surface-variant block">Average of all student scores</span>
                            </div>
                        </div>

                        {/* Pass Rate */}
                        <div className="bg-surface-container rounded-2xl p-6 border border-outline/20 flex items-center justify-between shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 text-9xl pointer-events-none">🎓</div>
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Pass Rate</span>
                                <span className="text-4xl font-black text-green-500 tracking-tight block">
                                    {performanceData.summary.pass_rate}%
                                </span>
                                <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1.5">
                                    <div 
                                        className="bg-green-500 h-full rounded-full transition-all duration-500" 
                                        style={{ width: `${performanceData.summary.pass_rate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* High Score */}
                        <div className="bg-surface-container rounded-2xl p-6 border border-outline/20 flex items-center justify-between shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 text-9xl pointer-events-none">🏆</div>
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Highest Score</span>
                                <span className="text-4xl font-black text-primary tracking-tight block">
                                    {performanceData.summary.high_score}%
                                </span>
                                <span className="text-xs text-on-surface-variant block">Top score in class</span>
                            </div>
                        </div>

                        {/* Low Score */}
                        <div className="bg-surface-container rounded-2xl p-6 border border-outline/20 flex items-center justify-between shadow-sm relative overflow-hidden">
                            <div className="absolute right-0 bottom-0 translate-x-3 translate-y-3 opacity-10 text-9xl pointer-events-none">📉</div>
                            <div className="space-y-2">
                                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block">Lowest Score</span>
                                <span className="text-4xl font-black text-red-500 tracking-tight block">
                                    {performanceData.summary.low_score}%
                                </span>
                                <span className="text-xs text-on-surface-variant block">Lowest score in class</span>
                            </div>
                        </div>
                    </div>

                    {/* Chart and distribution stats */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Grade Distribution Chart */}
                        <div className="bg-surface-container rounded-2xl p-6 border border-outline/20 lg:col-span-2 space-y-6">
                            <div>
                                <h3 className="font-bold text-lg text-on-surface">Grade Distribution</h3>
                                <p className="text-xs text-on-surface-variant">Class-wide grade achievements count.</p>
                            </div>
                            <div className="h-64 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={performanceData.grade_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                        <XAxis dataKey="grade" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} />
                                        <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} allowDecimals={false} />
                                        <Tooltip 
                                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                                            contentStyle={{
                                                backgroundColor: 'var(--color-surface-container-high, #1F2937)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: '8px',
                                                color: 'var(--color-text-normal, #F3F4F6)'
                                            }}
                                        />
                                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                            {performanceData.grade_distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* General stats metrics */}
                        <div className="bg-surface-container rounded-2xl p-6 border border-outline/20 space-y-6 flex flex-col justify-between">
                            <div>
                                <h3 className="font-bold text-lg text-on-surface">Class Analytics Summary</h3>
                                <p className="text-xs text-on-surface-variant">Overview of registration and data counts.</p>
                            </div>
                            
                            <div className="divide-y divide-outline/10 flex-1 flex flex-col justify-center">
                                <div className="py-3 flex justify-between items-center">
                                    <span className="text-sm text-on-surface-variant font-medium">Total Students</span>
                                    <span className="text-sm font-bold text-on-surface">{performanceData.summary.total_students}</span>
                                </div>
                                <div className="py-3 flex justify-between items-center">
                                    <span className="text-sm text-on-surface-variant font-medium">Graded Records</span>
                                    <span className="text-sm font-bold text-on-surface">{performanceData.summary.graded_count}</span>
                                </div>
                                <div className="py-3 flex justify-between items-center">
                                    <span className="text-sm text-on-surface-variant font-medium">Pass Count</span>
                                    <span className="text-sm font-bold text-green-500">
                                        {Math.round(performanceData.summary.graded_count * (performanceData.summary.pass_rate / 100))}
                                    </span>
                                </div>
                                <div className="py-3 flex justify-between items-center">
                                    <span className="text-sm text-on-surface-variant font-medium">Fail Count</span>
                                    <span className="text-sm font-bold text-red-500">
                                        {performanceData.summary.graded_count - Math.round(performanceData.summary.graded_count * (performanceData.summary.pass_rate / 100))}
                                    </span>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-outline/10 text-xs text-on-surface-variant text-center">
                                Passing criteria is set to a score of **45%** or higher.
                            </div>
                        </div>
                    </div>

                    {/* Rankings Leaderboard */}
                    <div className="bg-surface-container rounded-2xl border border-outline/20 overflow-hidden">
                        <div className="p-6 border-b border-outline/10 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg text-on-surface">Student Rankings Leaderboard</h3>
                                <p className="text-xs text-on-surface-variant">Students sorted by overall average score.</p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-container-highest/30 text-on-surface-variant font-semibold">
                                    <tr>
                                        <th className="px-6 py-3.5 text-center w-20">Rank</th>
                                        <th className="px-6 py-3.5">Student</th>
                                        <th className="px-6 py-3.5">Admission No</th>
                                        <th className="px-6 py-3.5 text-center">Subjects Graded</th>
                                        <th className="px-6 py-3.5 text-right w-36">Total Score</th>
                                        <th className="px-6 py-3.5 text-right w-36">Average Score</th>
                                        <th className="px-6 py-3.5 w-40">Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline/10">
                                    {performanceData.leaderboard.map((student, idx) => {
                                        const isTop3 = typeof student.rank === 'number' && student.rank <= 3;
                                        const rankEmoji = student.rank === 1 ? '🥇' : student.rank === 2 ? '🥈' : student.rank === 3 ? '🥉' : '';
                                        
                                        return (
                                            <tr key={student.student_id} className="hover:bg-surface-container-high/30 transition-colors">
                                                <td className="px-6 py-4 text-center">
                                                    {isTop3 ? (
                                                        <span className="text-xl inline-block" title={`Rank ${student.rank}`}>{rankEmoji}</span>
                                                    ) : (
                                                        <span className="font-bold text-on-surface-variant">{student.rank}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-on-surface block">{student.name}</span>
                                                </td>
                                                <td className="px-6 py-4 text-on-surface-variant">
                                                    {student.admission_number}
                                                </td>
                                                <td className="px-6 py-4 text-center text-on-surface-variant font-medium">
                                                    {student.subjects_count}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-on-surface">
                                                    {student.total_score}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-primary">
                                                    {student.average_score}%
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                                                        <div 
                                                            className={`h-full rounded-full transition-all duration-300 ${
                                                                student.average_score >= 70 ? 'bg-green-500' :
                                                                student.average_score >= 50 ? 'bg-primary' :
                                                                student.average_score >= 45 ? 'bg-yellow-500' : 'bg-red-500'
                                                            }`} 
                                                            style={{ width: `${student.average_score}%` }}
                                                        ></div>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {performanceData.leaderboard.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center p-8 text-on-surface-variant">
                                                No ranked students found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Subject Breakdown */}
                    <div className="bg-surface-container rounded-2xl border border-outline/20 overflow-hidden">
                        <div className="p-6 border-b border-outline/10">
                            <h3 className="font-bold text-lg text-on-surface">Subject-wise Breakdown</h3>
                            <p className="text-xs text-on-surface-variant">Averages and high/low scores per subject.</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-container-highest/30 text-on-surface-variant font-semibold">
                                    <tr>
                                        <th className="px-6 py-3.5">Code</th>
                                        <th className="px-6 py-3.5">Subject</th>
                                        <th className="px-6 py-3.5 text-right">Class Average</th>
                                        <th className="px-6 py-3.5 text-right">Highest Score</th>
                                        <th className="px-6 py-3.5 text-right">Lowest Score</th>
                                        <th className="px-6 py-3.5 text-right">Pass Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline/10">
                                    {performanceData.subject_performance.map((subject) => (
                                        <tr key={subject.id} className="hover:bg-surface-container-high/30 transition-colors">
                                            <td className="px-6 py-4 font-mono text-xs text-on-surface-variant font-semibold">
                                                {subject.code}
                                            </td>
                                            <td className="px-6 py-4 font-semibold text-on-surface">
                                                {subject.name}
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold text-on-surface">
                                                {subject.average}%
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-green-500">
                                                {subject.high}%
                                            </td>
                                            <td className="px-6 py-4 text-right font-semibold text-red-500">
                                                {subject.low}%
                                            </td>
                                            <td className="px-6 py-4 text-right font-bold">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs ${
                                                    subject.pass_rate >= 75 ? 'bg-green-500/10 text-green-500' :
                                                    subject.pass_rate >= 50 ? 'bg-yellow-500/10 text-yellow-500' :
                                                    'bg-red-500/10 text-red-500'
                                                }`}>
                                                    {subject.pass_rate}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {performanceData.subject_performance.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center p-8 text-on-surface-variant">
                                                No subject records found.
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
    );
}
