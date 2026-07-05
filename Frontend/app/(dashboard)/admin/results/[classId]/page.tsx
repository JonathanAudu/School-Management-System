'use client';

import { useState, useEffect, use } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Student { id: number; first_name: string; last_name: string; student_id: string; admission_number: string; registered_subjects?: any[]; }
interface Subject { id: number; name: string; }
interface ClassSubject { id: number; subject_id: number; subject: Subject; }
interface Result { id?: number; student_id: number; subject_id: number; ca1: number | ''; ca2: number | ''; exam: number | ''; total_score?: number; grade?: string; remark?: string; }

export default function ResultEntrySheet({ params }: { params: Promise<{ classId: string }> }) {
    const { classId } = use(params);
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session');
    const termId = searchParams.get('term');
    const termType = searchParams.get('type');

    const [students, setStudents] = useState<Student[]>([]);
    const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
    const [results, setResults] = useState<Result[]>([]);
    
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    
    const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
    const [previewStudentId, setPreviewStudentId] = useState<number | null>(null);

    useEffect(() => {
        if (sessionId && termId && termType) {
            fetchGrid();
        }
    }, [sessionId, termId, termType]);

    const fetchGrid = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:8000/api/results/grid', {
                academic_session_id: sessionId,
                term_id: termId,
                term_type: termType,
                school_class_id: classId,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStudents(res.data.students);
            setClassSubjects(res.data.subjects);
            
            // Map fetched results
            const fetchedResults: Result[] = res.data.results.map((r: any) => ({
                id: r.id,
                student_id: r.student_id,
                subject_id: r.subject_id,
                ca1: r.ca1 ?? '',
                ca2: r.ca2 ?? '',
                exam: r.exam ?? '',
                total_score: r.total_score,
                grade: r.grade,
                remark: r.remark,
            }));
            setResults(fetchedResults);
            
            if (res.data.subjects.length > 0) {
                setSelectedSubjectId(res.data.subjects[0].subject_id);
            }

            const approval = res.data.approval;
            setIsLocked(approval ? (approval.form_teacher_status === 'approved' || approval.admin_status === 'approved') : false);

        } catch (error) {
            toast.error('Failed to load result grid');
        } finally {
            setIsLoading(false);
        }
    };

    const getResultForStudent = (studentId: number) => {
        if (!selectedSubjectId) return null;
        let res = results.find(r => r.student_id === studentId && r.subject_id === selectedSubjectId);
        if (!res) {
            res = { student_id: studentId, subject_id: selectedSubjectId, ca1: '', ca2: '', exam: '' };
            // Add to results array so we can track edits
            setResults(prev => [...prev, res!]);
        }
        return res;
    };

    const handleResultChange = (studentId: number, field: 'ca1'|'ca2'|'exam', value: string) => {
        if (!selectedSubjectId) return;
        const numVal = value === '' ? '' : Math.min(100, Math.max(0, parseFloat(value)));
        
        setResults(prev => {
            const copy = [...prev];
            const idx = copy.findIndex(r => r.student_id === studentId && r.subject_id === selectedSubjectId);
            if (idx >= 0) {
                copy[idx] = { ...copy[idx], [field]: numVal };
            }
            return copy;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const validResults = results.filter(r => r.ca1 !== '' || r.ca2 !== '' || r.exam !== '');
            
            await axios.post('http://localhost:8000/api/results/save', {
                academic_session_id: sessionId,
                term_id: termId,
                term_type: termType,
                school_class_id: classId,
                results: validResults
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Scores saved successfully');
            fetchGrid(); // Refresh to get grades and totals
        } catch (error) {
            toast.error('Failed to save scores');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePreviewPdf = async (studentId: number) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`http://localhost:8000/api/report-card/${studentId}`, {
                params: {
                    academic_session_id: sessionId,
                    term_id: termId,
                    term_type: termType,
                    school_class_id: classId,
                },
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            setPreviewPdfUrl(url);
            setPreviewStudentId(studentId);
        } catch (error) {
            toast.error('Failed to load report card preview');
        }
    };

    const executeDownloadPdf = () => {
        if (!previewPdfUrl || !previewStudentId) return;
        const link = document.createElement('a');
        link.href = previewPdfUrl;
        link.setAttribute('download', `report_card_${previewStudentId}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    };

    const closePreview = () => {
        if (previewPdfUrl) {
            window.URL.revokeObjectURL(previewPdfUrl);
        }
        setPreviewPdfUrl(null);
        setPreviewStudentId(null);
    };

    if (isLoading) return <div className="p-6 text-center text-on-surface-variant animate-pulse">Loading score entry sheet...</div>;

    const termLabel = termType === 'mid_term' ? 'Mid-Term' : 'End of Term';

    return (
        <div className="space-y-6 pb-20">
            {isLocked && (
                <div className="p-4 bg-red-500/10 text-red-600 border border-red-500/20 rounded-2xl text-sm font-semibold flex items-center gap-2">
                    <span>🔒</span> Scores are locked because the results for this class have been approved and signed off.
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container rounded-2xl p-6 border border-outline/20">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Link href="/admin/results" className="text-primary hover:underline text-sm font-medium">
                            &larr; Back to Dashboard
                        </Link>
                    </div>
                    <h2 className="text-xl font-bold text-on-surface">Score Entry Sheet</h2>
                    <p className="text-sm text-on-surface-variant mt-1">
                        {termLabel} Assessment
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="px-4 py-2 bg-surface-container-high text-on-surface rounded-lg font-medium hover:bg-surface-container-highest transition-colors text-sm">
                        Export CSV
                    </button>
                    <button 
                        onClick={handleSave}
                        disabled={isSaving || isLocked}
                        className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : isLocked ? 'Scores Locked' : 'Save Scores'}
                    </button>
                </div>
            </div>

            <div className="bg-surface-container rounded-2xl border border-outline/20 overflow-hidden">
                <div className="p-4 bg-surface-container-high border-b border-outline/20 flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium text-on-surface-variant mr-2">Select Subject:</span>
                    {classSubjects.map(cs => (
                        <button
                            key={cs.id}
                            onClick={() => setSelectedSubjectId(cs.subject_id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                selectedSubjectId === cs.subject_id 
                                ? 'bg-primary text-on-primary' 
                                : 'bg-surface-container hover:bg-surface-container-highest text-on-surface border border-outline/20'
                            }`}
                        >
                            {cs.subject?.name}
                        </button>
                    ))}
                    {classSubjects.length === 0 && (
                        <span className="text-sm text-yellow-500">No subjects assigned to this class.</span>
                    )}
                </div>

                {selectedSubjectId && students.length > 0 && (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-surface-container-highest/30 text-on-surface-variant">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Student Name</th>
                                    <th className="px-6 py-3 font-medium">Admission No</th>
                                    <th className="px-6 py-3 font-medium text-center w-28">CA 1</th>
                                    <th className="px-6 py-3 font-medium text-center w-28">CA 2</th>
                                    <th className="px-6 py-3 font-medium text-center w-28">Exam</th>
                                    <th className="px-6 py-3 font-medium text-center">Total</th>
                                    <th className="px-6 py-3 font-medium text-center">Grade</th>
                                    <th className="px-6 py-3 font-medium">Remark</th>
                                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline/10">
                                {students.map(student => {
                                    const hasRegistered = student.registered_subjects?.some((rs: any) => rs.id === selectedSubjectId);
                                    const hasExistingResult = results.some(r => r.student_id === student.id && r.subject_id === selectedSubjectId);
                                    
                                    // Only show student if they have an approved subject registration OR an existing result record
                                    if (!hasRegistered && !hasExistingResult) return null;

                                    const res = getResultForStudent(student.id);
                                    if (!res) return null;
                                    
                                    return (
                                        <tr key={student.id} className="hover:bg-surface-container-high/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-on-surface">
                                                {student.first_name} {student.last_name}
                                            </td>
                                            <td className="px-6 py-4 text-on-surface-variant">
                                                {student.admission_number}
                                            </td>
                                            <td className="px-6 py-2">
                                                <input 
                                                    type="number" 
                                                    value={res.ca1} 
                                                    disabled={isLocked}
                                                    onChange={(e) => handleResultChange(student.id, 'ca1', e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-surface-container-lowest border border-outline/20 rounded text-center focus:outline-none focus:border-primary text-on-surface disabled:opacity-60 disabled:cursor-not-allowed"
                                                    placeholder="-"
                                                />
                                            </td>
                                            <td className="px-6 py-2">
                                                <input 
                                                    type="number" 
                                                    value={res.ca2} 
                                                    disabled={isLocked}
                                                    onChange={(e) => handleResultChange(student.id, 'ca2', e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-surface-container-lowest border border-outline/20 rounded text-center focus:outline-none focus:border-primary text-on-surface disabled:opacity-60 disabled:cursor-not-allowed"
                                                    placeholder="-"
                                                />
                                            </td>
                                            <td className="px-6 py-2">
                                                <input 
                                                    type="number" 
                                                    value={res.exam} 
                                                    disabled={isLocked}
                                                    onChange={(e) => handleResultChange(student.id, 'exam', e.target.value)}
                                                    className="w-full px-2 py-1.5 bg-surface-container-lowest border border-outline/20 rounded text-center focus:outline-none focus:border-primary text-on-surface disabled:opacity-60 disabled:cursor-not-allowed"
                                                    placeholder="-"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-on-surface">
                                                {res.total_score ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2 py-1 rounded font-bold text-xs ${res.grade ? 'bg-surface-container-highest text-primary' : ''}`}>
                                                    {res.grade ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-on-surface-variant text-xs font-medium uppercase tracking-wider">
                                                {res.remark ?? '-'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handlePreviewPdf(student.id)}
                                                    className="px-3 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-xs font-medium transition-colors"
                                                    title="Preview Report Card PDF"
                                                >
                                                    📄 PDF
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                {students.length === 0 && (
                    <div className="p-8 text-center text-on-surface-variant">
                        No students enrolled in this class.
                    </div>
                )}
            </div>

            {/* Modal for PDF Preview */}
            {previewPdfUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-surface rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-outline/20 flex justify-between items-center bg-surface-container-low">
                            <h3 className="text-lg font-bold text-on-surface">Report Card Preview</h3>
                            <div className="flex gap-3">
                                <button onClick={executeDownloadPdf} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
                                    Download PDF
                                </button>
                                <button onClick={closePreview} className="px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface rounded-lg text-sm font-medium transition-colors">
                                    Close
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 bg-surface-container-lowest overflow-hidden">
                            <iframe src={previewPdfUrl} className="w-full h-full min-h-[70vh] border-0" title="PDF Preview"></iframe>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
