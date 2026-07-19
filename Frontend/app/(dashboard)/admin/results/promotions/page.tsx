'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { toast } from 'react-hot-toast';

interface AcademicSession { id: number; name: string; status?: string; is_current?: boolean; }
interface Term { id: number; name: string; is_current: boolean; }
interface SchoolClass { id: number; level_name: string; arm_name: string; full_name: string; }

interface Candidate {
    id: number;
    name: string;
    admission_number: string;
    session_average: number;
    subjects_count: number;
    recommendation: 'promote' | 'repeat';
    // Frontend UI state per student:
    selectedAction?: 'promote' | 'repeat';
    targetClassId?: string;
    isSelected?: boolean;
}

export default function PromotionsPage() {
    const [lookups, setLookups] = useState<{ sessions: AcademicSession[]; terms: Term[]; classes: SchoolClass[] }>({
        sessions: [],
        terms: [],
        classes: []
    });

    const [filterSourceSession, setFilterSourceSession] = useState('');
    const [filterTargetSession, setFilterTargetSession] = useState('');
    const [filterClassLevel, setFilterClassLevel] = useState('');
    const [filterClassId, setFilterClassId] = useState('');

    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        fetchLookups();
    }, []);

    const fetchLookups = async () => {
        try {
            const res = await axios.get('/api/lookups');
            setLookups(res.data);

            if (res.data.sessions.length > 0) {
                const currentSession = res.data.sessions.find((s: AcademicSession) => s.status === 'active') || res.data.sessions[0];
                setFilterSourceSession(currentSession.id.toString());
                
                // Set target session to the next session by default (if exists)
                const currentIndex = res.data.sessions.findIndex((s: AcademicSession) => s.id === currentSession.id);
                if (currentIndex >= 0 && currentIndex + 1 < res.data.sessions.length) {
                    setFilterTargetSession(res.data.sessions[currentIndex + 1].id.toString());
                } else if (res.data.sessions.length > 1) {
                    setFilterTargetSession(res.data.sessions[0].id.toString());
                }
            }
        } catch (error) {
            toast.error('Failed to load classes and sessions');
        }
    };

    // Parse class name to suggest next level (e.g. JSS 1 -> JSS 2, SSS 1 -> SSS 2)
    const getNextLevelName = (level: string): string => {
        if (level.startsWith('JSS ')) {
            const num = parseInt(level.replace('JSS ', ''));
            if (num === 3) return 'SSS 1';
            return `JSS ${num + 1}`;
        }
        if (level.startsWith('SSS ')) {
            const num = parseInt(level.replace('SSS ', ''));
            if (num === 3) return 'Graduated';
            return `SSS ${num + 1}`;
        }
        return '';
    };

    const handleLoadCandidates = async () => {
        if (!filterSourceSession || !filterClassId) {
            toast.error('Please select source session and class');
            return;
        }

        setIsLoading(true);
        setCandidates([]);
        try {
            const res = await axios.get('/api/promotions/candidates', {
                params: {
                    academic_session_id: filterSourceSession,
                    school_class_id: filterClassId
                }
            });

            const currentClass = lookups.classes.find(c => c.id.toString() === filterClassId);
            const currentLevel = currentClass?.level_name || '';
            const currentArm = currentClass?.arm_name || '';
            const nextLevel = getNextLevelName(currentLevel);

            // Suggest the same arm name in the next level (e.g. JSS 1 A -> JSS 2 A)
            const defaultTargetClass = lookups.classes.find(
                c => c.level_name === nextLevel && c.arm_name === currentArm
            ) || lookups.classes.find(
                c => c.level_name === nextLevel
            );

            const initialCandidates = res.data.candidates.map((cand: any) => ({
                ...cand,
                selectedAction: cand.recommendation,
                // Default target class to suggested next level, or fallback to current class if repeating
                targetClassId: cand.recommendation === 'promote' && defaultTargetClass 
                    ? defaultTargetClass.id.toString() 
                    : filterClassId,
                isSelected: true // checked by default
            }));

            setCandidates(initialCandidates);
            setIsLoaded(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch candidate list');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCandidateActionChange = (id: number, action: 'promote' | 'repeat') => {
        setCandidates(prev => prev.map(c => {
            if (c.id === id) {
                // If switching to repeat, set target class back to current class
                // If switching to promote, try to find the next level class
                let targetId = c.targetClassId;
                if (action === 'repeat') {
                    targetId = filterClassId;
                } else {
                    const currentClass = lookups.classes.find(cls => cls.id.toString() === filterClassId);
                    const currentLevel = currentClass?.level_name || '';
                    const currentArm = currentClass?.arm_name || '';
                    const nextLevel = getNextLevelName(currentLevel);
                    const suggestedClass = lookups.classes.find(
                        cls => cls.level_name === nextLevel && cls.arm_name === currentArm
                    ) || lookups.classes.find(
                        cls => cls.level_name === nextLevel
                    );
                    if (suggestedClass) {
                        targetId = suggestedClass.id.toString();
                    }
                }

                return { ...c, selectedAction: action, targetClassId: targetId };
            }
            return c;
        }));
    };

    const handleCandidateTargetClassChange = (id: number, targetClassId: string) => {
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, targetClassId } : c));
    };

    const handleCandidateSelectChange = (id: number, val: boolean) => {
        setCandidates(prev => prev.map(c => c.id === id ? { ...c, isSelected: val } : c));
    };

    const handleSelectAllChange = (val: boolean) => {
        setCandidates(prev => prev.map(c => ({ ...c, isSelected: val })));
    };

    // Bulk apply actions to checked candidates
    const handleBulkApplyAction = (action: 'promote' | 'repeat') => {
        const checkedCount = candidates.filter(c => c.isSelected).length;
        if (checkedCount === 0) {
            toast.error('No students selected');
            return;
        }

        setCandidates(prev => prev.map(c => {
            if (c.isSelected) {
                let targetId = c.targetClassId;
                if (action === 'repeat') {
                    targetId = filterClassId;
                } else {
                    const currentClass = lookups.classes.find(cls => cls.id.toString() === filterClassId);
                    const currentLevel = currentClass?.level_name || '';
                    const currentArm = currentClass?.arm_name || '';
                    const nextLevel = getNextLevelName(currentLevel);
                    const suggestedClass = lookups.classes.find(
                        cls => cls.level_name === nextLevel && cls.arm_name === currentArm
                    ) || lookups.classes.find(
                        cls => cls.level_name === nextLevel
                    );
                    if (suggestedClass) {
                        targetId = suggestedClass.id.toString();
                    }
                }
                return { ...c, selectedAction: action, targetClassId: targetId };
            }
            return c;
        }));
        toast.success(`Applied "${action === 'promote' ? 'Promote' : 'Repeat'}" to ${checkedCount} students`);
    };

    const handleExecutePromotions = () => {
        const selectedCandidates = candidates.filter(c => c.isSelected);
        if (selectedCandidates.length === 0) {
            toast.error('No students selected for promotion processing');
            return;
        }

        if (!filterSourceSession || !filterTargetSession) {
            toast.error('Please specify both source and target academic sessions');
            return;
        }

        if (filterSourceSession === filterTargetSession) {
            toast.error('Source and Target sessions cannot be the same');
            return;
        }

        // Validate that all promoted students have a target class selected
        const invalidPromos = selectedCandidates.filter(c => c.selectedAction === 'promote' && !c.targetClassId);
        if (invalidPromos.length > 0) {
            toast.error(`Please select a target class for all promoted students (e.g. ${invalidPromos[0].name})`);
            return;
        }

        setShowConfirmModal(true);
    };

    const executeAction = async () => {
        const selectedCandidates = candidates.filter(c => c.isSelected);
        setIsSubmitting(true);
        try {
            const promotionsPayload = selectedCandidates.map(c => ({
                student_id: c.id,
                action: c.selectedAction,
                target_school_class_id: c.selectedAction === 'promote' ? parseInt(c.targetClassId || '0') : null
            }));

            await axios.post('/api/promotions/promote', {
                source_academic_session_id: parseInt(filterSourceSession),
                target_academic_session_id: parseInt(filterTargetSession),
                source_school_class_id: parseInt(filterClassId),
                promotions: promotionsPayload
            });

            toast.success('Bulk promotions processed successfully');
            // Reload candidate lists
            handleLoadCandidates();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Promotion process failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const uniqueClasses = Array.from(new Set(lookups.classes.map(c => c.level_name)));
    const armsForClass = lookups.classes.filter(c => c.level_name === filterClassLevel);
    
    // Available target sessions (usually forward)
    const targetSessions = lookups.sessions.filter(s => s.id.toString() !== filterSourceSession);

    const allChecked = candidates.length > 0 && candidates.every(c => c.isSelected);
    const someChecked = candidates.length > 0 && candidates.some(c => c.isSelected) && !allChecked;

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-on-surface">Student Promotion Management</h1>
                <p className="text-sm text-on-surface-variant mt-1">
                    Review final class averages and perform bulk session-end promotions/repetitions.
                </p>
            </div>

            {/* Filter Panel */}
            <div className="bg-surface-container rounded-2xl p-6 border border-outline/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Source Session</label>
                        <select 
                            value={filterSourceSession} 
                            onChange={e => {
                                setFilterSourceSession(e.target.value);
                                if (filterTargetSession === e.target.value) setFilterTargetSession('');
                            }} 
                            className="w-full px-4 py-2.5 border border-outline/20 rounded-xl bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                        >
                            <option value="">Select Session</option>
                            {lookups.sessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Source Class Level</label>
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

                    <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Source Class Arm</label>
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

                    <div>
                        <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">Target Session (New)</label>
                        <select 
                            value={filterTargetSession} 
                            onChange={e => setFilterTargetSession(e.target.value)} 
                            className="w-full px-4 py-2.5 border border-outline/20 rounded-xl bg-surface-container-highest text-on-surface focus:outline-none focus:ring-2 focus:ring-primary text-sm font-medium"
                        >
                            <option value="">Select Target Session</option>
                            {targetSessions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="flex">
                        <button
                            onClick={handleLoadCandidates}
                            disabled={!filterSourceSession || !filterClassId || isLoading}
                            className="w-full py-2.5 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/95 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md text-sm flex justify-center items-center gap-2"
                        >
                            {isLoading ? 'Loading...' : 'Analyze Candidates'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Candidates Content */}
            {isLoading && (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-on-surface-variant font-medium animate-pulse">Calculating averages and recommendations...</p>
                </div>
            )}

            {!isLoading && !isLoaded && (
                <div className="p-12 text-center border border-outline/20 border-dashed rounded-2xl text-on-surface-variant max-w-2xl mx-auto mt-6">
                    <span className="text-5xl block mb-4">🎓</span>
                    <h3 className="text-lg font-bold text-on-surface mb-2">Promotion Candidates List</h3>
                    <p className="text-sm">Select the parameters above and click "Analyze Candidates" to view student performance averages and promote them to the next session.</p>
                </div>
            )}

            {!isLoading && isLoaded && candidates.length === 0 && (
                <div className="p-12 text-center border border-outline/20 border-dashed rounded-2xl text-on-surface-variant">
                    No active students found in this class.
                </div>
            )}

            {!isLoading && isLoaded && candidates.length > 0 && (
                <div className="space-y-6">
                    {/* Bulk controls bar */}
                    <div className="bg-surface-container-low p-4 rounded-xl border border-outline/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="text-sm font-medium text-on-surface-variant">
                            Selected: <strong className="text-on-surface">{candidates.filter(c => c.isSelected).length}</strong> of {candidates.length} students
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider self-center mr-2">Bulk Apply:</span>
                            <button
                                onClick={() => handleBulkApplyAction('promote')}
                                className="px-3.5 py-1.5 bg-blue-500/10 text-blue-600 border border-blue-500/20 rounded-lg text-xs font-bold hover:bg-blue-500/20 transition-colors"
                            >
                                Promote Selected
                            </button>
                            <button
                                onClick={() => handleBulkApplyAction('repeat')}
                                className="px-3.5 py-1.5 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-lg text-xs font-bold hover:bg-yellow-500/20 transition-colors"
                            >
                                Repeat Selected
                            </button>
                        </div>
                    </div>

                    {/* Candidates Table */}
                    <div className="bg-surface-container rounded-2xl border border-outline/20 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-container-highest/30 text-on-surface-variant font-semibold">
                                    <tr>
                                        <th className="px-6 py-4 w-12 text-center">
                                            <input 
                                                type="checkbox" 
                                                checked={allChecked}
                                                ref={el => {
                                                    if (el) el.indeterminate = someChecked;
                                                }}
                                                onChange={e => handleSelectAllChange(e.target.checked)}
                                                className="rounded border-outline/30 text-primary focus:ring-primary w-4 h-4"
                                            />
                                        </th>
                                        <th className="px-6 py-4">Student</th>
                                        <th className="px-6 py-4">Admission No</th>
                                        <th className="px-6 py-4 text-right">Average Score</th>
                                        <th className="px-6 py-4 text-center">System Rec</th>
                                        <th className="px-6 py-4">Action</th>
                                        <th className="px-6 py-4">Target Destination Class</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline/10">
                                    {candidates.map((cand) => {
                                        const isPromote = cand.selectedAction === 'promote';
                                        return (
                                            <tr key={cand.id} className={`hover:bg-surface-container-high/30 transition-colors ${!cand.isSelected ? 'opacity-60' : ''}`}>
                                                <td className="px-6 py-4 text-center">
                                                    <input 
                                                        type="checkbox" 
                                                        checked={cand.isSelected || false}
                                                        onChange={e => handleCandidateSelectChange(cand.id, e.target.checked)}
                                                        className="rounded border-outline/30 text-primary focus:ring-primary w-4 h-4"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-bold text-on-surface block">{cand.name}</span>
                                                    <span className="text-xs text-on-surface-variant block">{cand.subjects_count} subjects graded</span>
                                                </td>
                                                <td className="px-6 py-4 text-on-surface-variant font-mono">
                                                    {cand.admission_number}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-on-surface">
                                                    {cand.session_average}%
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                                        cand.recommendation === 'promote' 
                                                        ? 'bg-blue-500/10 text-blue-500' 
                                                        : 'bg-yellow-500/10 text-yellow-600'
                                                    }`}>
                                                        {cand.recommendation === 'promote' ? 'Promote' : 'Repeat'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={cand.selectedAction || 'promote'}
                                                        onChange={e => handleCandidateActionChange(cand.id, e.target.value as 'promote' | 'repeat')}
                                                        className="px-3 py-1.5 border border-outline/20 rounded-lg bg-surface-container-high text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-xs font-bold"
                                                    >
                                                        <option value="promote">Promote</option>
                                                        <option value="repeat">Repeat</option>
                                                    </select>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {isPromote ? (
                                                        <select
                                                            value={cand.targetClassId || ''}
                                                            onChange={e => handleCandidateTargetClassChange(cand.id, e.target.value)}
                                                            className="px-3 py-1.5 border border-outline/20 rounded-lg bg-surface-container-high text-on-surface focus:outline-none focus:ring-1 focus:ring-primary text-xs font-semibold w-full max-w-xs"
                                                        >
                                                            <option value="">Select Destination Class...</option>
                                                            {lookups.classes.map(c => (
                                                                <option key={c.id} value={c.id}>{c.full_name} ({c.level_name} {c.arm_name})</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className="text-xs text-on-surface-variant font-medium italic">
                                                            Retains Current Class: {lookups.classes.find(c => c.id.toString() === filterClassId)?.full_name}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer Submit Button */}
                    <div className="flex justify-end p-4 bg-surface-container rounded-2xl border border-outline/20">
                        <button
                            onClick={handleExecutePromotions}
                            disabled={isSubmitting || !filterTargetSession}
                            className="px-8 py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/20 text-sm flex items-center gap-2"
                        >
                            {isSubmitting ? 'Processing Promotions...' : 'Execute Bulk Promotion'}
                        </button>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-md overflow-hidden shadow-xl border border-outline/20 animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4 mx-auto text-2xl">
                                🎓
                            </div>
                            <h2 className="text-xl font-bold text-on-surface mb-2">Confirm Promotions</h2>
                            <p className="text-on-surface-variant text-sm">
                                Are you sure you want to process promotion/repetition for **{candidates.filter(c => c.isSelected).length}** students? This will advance their academic records in the system.
                            </p>
                        </div>
                        <div className="p-4 bg-surface-container-highest flex justify-center gap-3 border-t border-outline/20">
                            <button 
                                onClick={() => setShowConfirmModal(false)} 
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-surface-container-high border border-outline/30 text-on-surface rounded-xl font-medium hover:bg-surface-container-highest transition-colors disabled:opacity-50 text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => {
                                    setShowConfirmModal(false);
                                    executeAction();
                                }} 
                                disabled={isSubmitting}
                                className="px-6 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
                            >
                                {isSubmitting ? 'Processing...' : 'Proceed'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
