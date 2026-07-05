'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface FormClass {
    id: number;
    level_name: string;
    arm_name: string;
    full_name: string;
    student_count: number;
    pending_registrations: number;
    approvals: {
        mid_term: { form_teacher_status: string; admin_status: string };
        end_of_term: { form_teacher_status: string; admin_status: string };
    };
}

interface SubjectTaught {
    class_subject_id: number;
    subject_id: number;
    subject_name: string;
    class_id: number;
    class_name: string;
    registered_students_count: number;
}

interface DashboardData {
    session: string;
    session_id: number | null;
    term_id: number | null;
    is_form_master: boolean;
    form_classes: FormClass[];
    subjects: SubjectTaught[];
}

interface StudentSubject {
    id: number;
    name: string;
    pivot: {
        status: 'pending' | 'approved' | 'rejected';
        academic_session_id: number;
    };
}

interface StudentRegistration {
    id: number;
    first_name: string;
    last_name: string;
    middle_name: string | null;
    admission_number: string;
    gender: string | null;
    status: string;
    parent_name: string | null;
    parent_phone: string | null;
    parent_email: string | null;
    registered_subjects: StudentSubject[];
}

export default function StaffDashboard() {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Form Master Specific States
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const [registrations, setRegistrations] = useState<StudentRegistration[]>([]);
    const [regsLoading, setRegsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'subjects' | 'registrations' | 'results'>('subjects');
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [isSavingApproval, setIsSavingApproval] = useState(false);

    // Lookups
    const [lookups, setLookups] = useState<{ sessions: any[], terms: any[], classes: any[] }>({ sessions: [], terms: [], classes: [] });

    // Edit student modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [isSavingStudent, setIsSavingStudent] = useState(false);

    // Manage subjects modal states
    const [showSubjectsModal, setShowSubjectsModal] = useState(false);
    const [subjectStudent, setSubjectStudent] = useState<any>(null);
    const [availableSubjects, setAvailableSubjects] = useState<any[]>([]);
    const [selectedSubjectIds, setSelectedSubjectIds] = useState<number[]>([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [savingSubjects, setSavingSubjects] = useState(false);

    useEffect(() => {
        fetchLookups();
    }, []);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.push('/login');
            } else if (user.role !== 'staff') {
                router.push(`/${user.role}`);
            } else {
                fetchDashboardData();
            }
        }
    }, [user, authLoading, router]);

    const fetchLookups = async () => {
        try {
            const res = await axios.get('/api/lookups');
            setLookups(res.data);
        } catch (err) {
            console.error('Failed to load lookups', err);
        }
    };

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get('/api/dashboard/staff');
            setData(res.data);
            
            if (res.data.is_form_master && res.data.form_classes && res.data.form_classes.length > 0) {
                const firstClass = res.data.form_classes[0];
                setSelectedClassId(prev => {
                    const exists = res.data.form_classes.some((c: any) => c.id === prev);
                    return exists ? prev : firstClass.id;
                });
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to load dashboard statistics');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRegistrations = async (sessionId: number | null, formClass: FormClass) => {
        if (!sessionId || !formClass) return;
        setRegsLoading(true);
        try {
            const res = await axios.get('/api/student-subjects/approvals', {
                params: {
                    academic_session_id: sessionId,
                    class: formClass.level_name,
                    arm: formClass.arm_name,
                }
            });
            const studentList = res.data.data || res.data;
            setRegistrations(studentList);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load class list');
        } finally {
            setRegsLoading(false);
        }
    };

    const activeClass = data?.is_form_master && data.form_classes && data.form_classes.length > 0
        ? (data.form_classes.find(c => c.id === selectedClassId) || data.form_classes[0])
        : null;

    useEffect(() => {
        if (data && activeClass) {
            fetchRegistrations(data.session_id, activeClass);
        }
    }, [selectedClassId, data?.session_id]);

    const handleSubjectApproval = async (studentId: number, subjectId: number, status: 'approved' | 'rejected') => {
        if (!data || !data.session_id) return;
        
        const actionKey = `${studentId}-${subjectId}-${status}`;
        setActionLoading(actionKey);

        try {
            await axios.post('/api/student-subjects/approve', {
                student_id: studentId,
                subject_id: subjectId,
                academic_session_id: data.session_id,
                status: status
            });
            
            toast.success(`Subject registration ${status} successfully!`);
            
            setRegistrations(prev => prev.map(student => {
                if (student.id === studentId) {
                    return {
                        ...student,
                        registered_subjects: student.registered_subjects.map(sub => {
                            if (sub.id === subjectId) {
                                return {
                                    ...sub,
                                    pivot: { ...sub.pivot, status }
                                };
                            }
                            return sub;
                        })
                    };
                }
                return student;
            }));

            const freshDashboard = await axios.get('/api/dashboard/staff');
            setData(freshDashboard.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update registration status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleUpdateResultApproval = async (termType: 'mid_term' | 'end_of_term', newStatus: 'approved' | 'pending') => {
        if (!data || !selectedClassId || !data.session_id || !data.term_id) return;
        setIsSavingApproval(true);

        try {
            await axios.post('/api/result-approvals/status', {
                academic_session_id: data.session_id,
                term_id: data.term_id,
                term_type: termType,
                school_class_id: selectedClassId,
                role: 'form_teacher',
                status: newStatus
            });

            toast.success(`Result status successfully updated to ${newStatus === 'approved' ? 'Approved' : 'Pending'}`);
            
            // Refresh dashboard data to update the status
            const freshDashboard = await axios.get('/api/dashboard/staff');
            setData(freshDashboard.data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to update result approval status');
        } finally {
            setIsSavingApproval(false);
        }
    };

    const openManageSubjectsModal = async (student: StudentRegistration) => {
        setSubjectStudent(student);
        setShowSubjectsModal(true);
        setLoadingSubjects(true);
        try {
            const res = await axios.get('/api/student/subjects/available', {
                params: {
                    student_id: student.id,
                    academic_session_id: data?.session_id
                }
            });
            setAvailableSubjects(res.data.available_subjects || []);
            const regIds = (res.data.registered_subjects || []).map((s: any) => s.subject_id);
            setSelectedSubjectIds(regIds);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load subjects registration status');
        } finally {
            setLoadingSubjects(false);
        }
    };

    const handleEditStudentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingStudent(true);
        try {
            await axios.put(`/api/students/${selectedStudent.id}`, selectedStudent);
            toast.success('Student profile updated successfully!');
            setShowEditModal(false);
            if (data && activeClass) {
                fetchRegistrations(data.session_id, activeClass);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update student profile.');
        } finally {
            setIsSavingStudent(false);
        }
    };

    const handleSaveSubjectsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subjectStudent || !data) return;
        setSavingSubjects(true);
        try {
            await axios.post('/api/student/subjects/register', {
                student_id: subjectStudent.id,
                academic_session_id: data.session_id,
                subject_ids: selectedSubjectIds
            });
            toast.success('Student subject registrations updated and approved successfully!');
            setShowSubjectsModal(false);
            if (activeClass) {
                fetchRegistrations(data.session_id, activeClass);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to save subject registrations');
        } finally {
            setSavingSubjects(false);
        }
    };

    const [previewingKey, setPreviewingKey] = useState<string | null>(null);

    const handlePreviewReportCard = async (studentId: number, termType: 'mid_term' | 'end_of_term') => {
        if (!data || !selectedClassId) return;
        const key = `${studentId}-${termType}`;
        setPreviewingKey(key);
        try {
            const res = await axios.get(`/api/report-card/${studentId}`, {
                params: {
                    academic_session_id: data.session_id,
                    term_id: data.term_id,
                    term_type: termType,
                    school_class_id: selectedClassId,
                },
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
            window.open(url, '_blank');
        } catch (error) {
            console.error(error);
            toast.error('Failed to generate report card PDF preview');
        } finally {
            setPreviewingKey(null);
        }
    };

    if (authLoading || isLoading || !user || !data) {
        return (
            <div className="container mx-auto px-6 py-12 space-y-6">
                <div className="h-12 bg-surface-container rounded-2xl w-1/4 animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-surface-container rounded-3xl animate-pulse"></div>
                    <div className="h-32 bg-surface-container rounded-3xl animate-pulse"></div>
                    <div className="h-32 bg-surface-container rounded-3xl animate-pulse"></div>
                </div>
                <div className="h-96 bg-surface-container rounded-3xl animate-pulse"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8 md:py-12 space-y-8">
            {/* Header section with HSL tailored design and smooth transition */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-on-surface">Staff Dashboard</h1>
                        <p className="text-on-surface-variant mt-1 text-sm">
                            Welcome back, <strong className="text-primary font-semibold">{user.name}</strong>!
                        </p>
                    </div>
                    {data.is_form_master && data.form_classes.length > 1 && (
                        <div className="flex items-center gap-2 sm:ml-6">
                            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Form Class:</span>
                            <select
                                value={selectedClassId || ''}
                                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                                className="bg-surface-container-high border border-outline/10 focus:border-primary rounded-xl text-sm px-3.5 py-2.5 text-on-surface focus:outline-none transition-all cursor-pointer font-semibold shadow-sm"
                            >
                                {data.form_classes.map((cls) => (
                                    <option key={cls.id} value={cls.id}>
                                        {cls.full_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <div className="px-4 py-2 bg-primary/10 border border-primary/20 text-primary font-medium text-xs rounded-full tracking-wider uppercase">
                    {data.session}
                </div>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 flex items-center justify-between">
                    <div>
                        <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider block">Subjects Taught</span>
                        <span className="text-4xl font-extrabold text-on-surface mt-2 block">{data.subjects.length}</span>
                    </div>
                    <div className="text-4xl bg-primary/10 p-4 rounded-2xl">📚</div>
                </div>

                {data.is_form_master && activeClass && (
                    <>
                        <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 flex items-center justify-between">
                            <div>
                                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider block">My Form Class</span>
                                <span className="text-xl font-bold text-on-surface mt-2 block">{activeClass.full_name}</span>
                                <span className="text-xs text-on-surface-variant mt-1 block">{activeClass.student_count} Enrolled Students</span>
                            </div>
                            <div className="text-4xl bg-secondary/10 p-4 rounded-2xl">🏫</div>
                        </div>

                        <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 flex items-center justify-between">
                            <div>
                                <span className="text-xs text-on-surface-variant font-medium uppercase tracking-wider block">Pending Registrations</span>
                                <span className="text-4xl font-extrabold text-on-surface mt-2 block flex items-center gap-2">
                                    {activeClass.pending_registrations}
                                    {activeClass.pending_registrations > 0 && (
                                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                                    )}
                                </span>
                            </div>
                            <div className="text-4xl bg-yellow-500/10 p-4 rounded-2xl">📝</div>
                        </div>
                    </>
                )}
            </div>

            {/* Dashboard Tabs for Form Masters */}
            {data.is_form_master && (
                <div className="flex border-b border-outline/10 gap-2">
                    <button
                        onClick={() => setActiveTab('subjects')}
                        className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                            activeTab === 'subjects' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        📚 Taught Subjects
                    </button>
                    <button
                        onClick={() => setActiveTab('registrations')}
                        className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] flex items-center gap-2 ${
                            activeTab === 'registrations' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        📝 Class List & Registrations
                        {activeClass && activeClass.pending_registrations > 0 && (
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                {activeClass.pending_registrations}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('results')}
                        className={`px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-[2px] ${
                            activeTab === 'results' 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-on-surface-variant hover:text-on-surface'
                        }`}
                    >
                        ✅ Class Results Approval
                    </button>
                </div>
            )}

            {/* View renders dynamically based on tabs */}
            {activeTab === 'subjects' && (
                <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface">
                    <h2 className="text-xl font-bold mb-4 font-serif">My Assigned Subjects</h2>
                    <p className="text-on-surface-variant text-sm mb-6">Below are the subjects currently assigned to you for this academic session. Select a button to begin grading student results.</p>
                    
                    {data.subjects.length === 0 ? (
                        <div className="p-8 text-center bg-surface-container rounded-2xl border border-outline/10 text-on-surface-variant">
                            No subject assignments found for you in this session. Please contact the administrator.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-surface-container-high/40 text-on-surface-variant">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold">Subject</th>
                                        <th className="px-6 py-4 font-semibold">Class Arm</th>
                                        <th className="px-6 py-4 font-semibold text-center">Approved Registrations</th>
                                        <th className="px-6 py-4 font-semibold text-right">Grade Recording Sheets</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline/10">
                                    {data.subjects.map((sub) => (
                                        <tr key={sub.class_subject_id} className="hover:bg-surface-container/30 transition-colors">
                                            <td className="px-6 py-4 font-medium text-on-surface">
                                                {sub.subject_name}
                                            </td>
                                            <td className="px-6 py-4 text-on-surface-variant">
                                                {sub.class_name}
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-on-surface">
                                                {sub.registered_students_count}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Link 
                                                    href={`/staff/results/${sub.class_id}?session=${data.session_id}&term=${data.term_id}&type=mid_term&subjectId=${sub.subject_id}`}
                                                    className="inline-block px-4 py-2 bg-surface-container hover:bg-surface-container-high border border-outline/20 text-on-surface text-xs font-semibold rounded-xl transition-all"
                                                >
                                                    Mid-Term
                                                </Link>
                                                <Link 
                                                    href={`/staff/results/${sub.class_id}?session=${data.session_id}&term=${data.term_id}&type=end_of_term&subjectId=${sub.subject_id}`}
                                                    className="inline-block px-4 py-2 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-sm"
                                                >
                                                    End of Term
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'registrations' && data.is_form_master && activeClass && (
                <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface">
                    <h2 className="text-xl font-bold mb-4 font-serif">Class List & Registrations</h2>
                    <p className="text-on-surface-variant text-sm mb-6">
                        View all enrolled students in your Form Class ({activeClass.full_name}). You can manage their registered subjects and edit their profile details.
                    </p>
                    
                    {regsLoading ? (
                        <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading class list...</div>
                    ) : registrations.length === 0 ? (
                        <div className="p-8 text-center text-on-surface-variant bg-surface-container rounded-2xl">
                            No students registered in this class.
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-surface-container rounded-2xl border border-outline/10">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead className="bg-surface-container-high text-xs font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline/10">
                                    <tr>
                                        <th className="px-6 py-4">Admission No</th>
                                        <th className="px-6 py-4">Name</th>
                                        <th className="px-6 py-4 text-center">Gender</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Subjects Registered</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-outline/10">
                                    {registrations.map((student) => {
                                        const totalSubjects = student.registered_subjects?.length || 0;
                                        const approvedSubjects = student.registered_subjects?.filter(s => s.pivot.status === 'approved').length || 0;
                                        const pendingSubjects = student.registered_subjects?.filter(s => s.pivot.status === 'pending').length || 0;
                                        return (
                                            <tr key={student.id} className="hover:bg-surface-container/30 transition-colors">
                                                <td className="px-6 py-4 font-mono font-bold text-on-surface text-xs sm:text-sm">
                                                    {student.admission_number}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="font-semibold text-on-surface block">
                                                        {student.first_name} {student.middle_name ? student.middle_name + ' ' : ''}{student.last_name}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center text-on-surface-variant">
                                                    {student.gender || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                                        student.status === 'Active' ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-600'
                                                    }`}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-medium">
                                                    <div className="text-on-surface font-semibold text-xs sm:text-sm">{totalSubjects} Subjects</div>
                                                    <div className="text-[10px] text-on-surface-variant mt-0.5 font-semibold">
                                                        <span className="text-green-600">{approvedSubjects} Approved</span>
                                                        {pendingSubjects > 0 && <span className="text-yellow-600 ml-1.5">&bull; {pendingSubjects} Pending</span>}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right space-x-2">
                                                    <button
                                                        disabled={previewingKey !== null}
                                                        onClick={() => handlePreviewReportCard(student.id, 'mid_term')}
                                                        className="inline-block px-3 py-1.5 bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 text-secondary text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                                                    >
                                                        {previewingKey === `${student.id}-mid_term` ? 'Generating...' : '📄 Mid-Term'}
                                                    </button>
                                                    <button
                                                        disabled={previewingKey !== null}
                                                        onClick={() => handlePreviewReportCard(student.id, 'end_of_term')}
                                                        className="inline-block px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
                                                    >
                                                        {previewingKey === `${student.id}-end_of_term` ? 'Generating...' : '📄 End of Term'}
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSubjectStudent(student);
                                                            openManageSubjectsModal(student);
                                                        }}
                                                        className="inline-block px-3 py-1.5 bg-surface-container hover:bg-surface-container-high border border-outline/20 text-on-surface text-xs font-semibold rounded-xl transition-all"
                                                    >
                                                        📚 Subjects
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedStudent({ ...student });
                                                            setShowEditModal(true);
                                                        }}
                                                        className="inline-block px-3 py-1.5 bg-primary text-on-primary text-xs font-semibold rounded-xl hover:bg-primary/95 transition-all shadow-sm"
                                                    >
                                                        ✏️ Edit Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'results' && data.is_form_master && activeClass && (
                <div className="bg-surface-container-low p-6 rounded-3xl shadow-sm border border-outline/10 text-on-surface">
                    <h2 className="text-xl font-bold mb-4 font-serif">Class Results Sign-off (Form Master Approval)</h2>
                    <p className="text-on-surface-variant text-sm mb-6">
                        Before student results are officially released for report card generation, they must be approved by the Class Form Master. Once signed off, the administration can finalize and publish the report cards.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Mid-Term Approval Card */}
                        <div className="bg-surface-container p-6 rounded-2xl border border-outline/10 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-on-surface">Mid-Term Results</h3>
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                    activeClass.approvals.mid_term.form_teacher_status === 'approved'
                                    ? 'bg-green-500/15 text-green-600'
                                    : 'bg-yellow-500/15 text-yellow-600'
                                }`}>
                                    {activeClass.approvals.mid_term.form_teacher_status === 'approved' ? 'Approved' : 'Pending Sign-off'}
                                </span>
                            </div>
                            
                            <div className="space-y-2 text-sm text-on-surface-variant">
                                <div className="flex justify-between">
                                    <span>Form Master Status:</span>
                                    <strong className="text-on-surface capitalize">{activeClass.approvals.mid_term.form_teacher_status}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>Principal/Admin Status:</span>
                                    <strong className="text-on-surface capitalize">{activeClass.approvals.mid_term.admin_status}</strong>
                                </div>
                            </div>

                            {activeClass.approvals.mid_term.admin_status !== 'approved' && (
                                <div className="p-3 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-xl text-xs font-medium flex items-center gap-2">
                                    <span>⚠️</span> Awaiting Principal's approval before Form Master sign-off.
                                </div>
                            )}

                            <div className="pt-4 border-t border-outline/10 flex justify-end">
                                {activeClass.approvals.mid_term.form_teacher_status === 'approved' ? (
                                    <button
                                        onClick={() => handleUpdateResultApproval('mid_term', 'pending')}
                                        disabled={isSavingApproval}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        Revoke Approval Status
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUpdateResultApproval('mid_term', 'approved')}
                                        disabled={isSavingApproval || activeClass.approvals.mid_term.admin_status !== 'approved'}
                                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    >
                                        Sign Off & Approve Mid-Term
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* End of Term Approval Card */}
                        <div className="bg-surface-container p-6 rounded-2xl border border-outline/10 space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg text-on-surface">End of Term Results</h3>
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                    activeClass.approvals.end_of_term.form_teacher_status === 'approved'
                                    ? 'bg-green-500/15 text-green-600'
                                    : 'bg-yellow-500/15 text-yellow-600'
                                }`}>
                                    {activeClass.approvals.end_of_term.form_teacher_status === 'approved' ? 'Approved' : 'Pending Sign-off'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-on-surface-variant">
                                <div className="flex justify-between">
                                    <span>Form Master Status:</span>
                                    <strong className="text-on-surface capitalize">{activeClass.approvals.end_of_term.form_teacher_status}</strong>
                                </div>
                                <div className="flex justify-between">
                                    <span>Principal/Admin Status:</span>
                                    <strong className="text-on-surface capitalize">{activeClass.approvals.end_of_term.admin_status}</strong>
                                </div>
                            </div>

                            {activeClass.approvals.end_of_term.admin_status !== 'approved' && (
                                <div className="p-3 bg-yellow-500/10 text-yellow-600 border border-yellow-500/20 rounded-xl text-xs font-medium flex items-center gap-2">
                                    <span>⚠️</span> Awaiting Principal's approval before Form Master sign-off.
                                </div>
                            )}

                            <div className="pt-4 border-t border-outline/10 flex justify-end">
                                {activeClass.approvals.end_of_term.form_teacher_status === 'approved' ? (
                                    <button
                                        onClick={() => handleUpdateResultApproval('end_of_term', 'pending')}
                                        disabled={isSavingApproval}
                                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-600 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        Revoke Approval Status
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleUpdateResultApproval('end_of_term', 'approved')}
                                        disabled={isSavingApproval || activeClass.approvals.end_of_term.admin_status !== 'approved'}
                                        className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm disabled:opacity-50 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
                                    >
                                        Sign Off & Approve End of Term
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT STUDENT PROFILE MODAL */}
            {showEditModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-lg shadow-xl border border-outline/20">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-on-surface">Edit Student Profile</h2>
                                <p className="text-xs text-on-surface-variant mt-0.5">Editing {selectedStudent.first_name} {selectedStudent.last_name}</p>
                            </div>
                            <button onClick={() => setShowEditModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl font-semibold">&times;</button>
                        </div>
                        <form onSubmit={handleEditStudentSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">First Name *</label>
                                    <input type="text" required value={selectedStudent.first_name} onChange={e => setSelectedStudent({...selectedStudent, first_name: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Last Name *</label>
                                    <input type="text" required value={selectedStudent.last_name} onChange={e => setSelectedStudent({...selectedStudent, last_name: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Middle Name</label>
                                    <input type="text" value={selectedStudent.middle_name || ''} onChange={e => setSelectedStudent({...selectedStudent, middle_name: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Gender *</label>
                                    <select required value={selectedStudent.gender || ''} onChange={e => setSelectedStudent({...selectedStudent, gender: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-outline/10 pt-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Class (Read-only)</label>
                                    <input type="text" disabled value={selectedStudent.class || ''} className="w-full px-4 py-2 border border-outline/10 rounded-lg bg-surface-container-high text-on-surface-variant cursor-not-allowed" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Arm (Read-only)</label>
                                    <input type="text" disabled value={selectedStudent.arm || ''} className="w-full px-4 py-2 border border-outline/10 rounded-lg bg-surface-container-high text-on-surface-variant cursor-not-allowed" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Status *</label>
                                <select required value={selectedStudent.status} onChange={e => setSelectedStudent({...selectedStudent, status: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Graduated">Graduated</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-outline/10 pt-4">
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Parent Name</label>
                                    <input type="text" value={selectedStudent.parent_name || ''} onChange={e => setSelectedStudent({...selectedStudent, parent_name: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Parent Phone</label>
                                    <input type="text" value={selectedStudent.parent_phone || ''} onChange={e => setSelectedStudent({...selectedStudent, parent_phone: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-on-surface-variant uppercase mb-1">Parent Email</label>
                                <input type="email" value={selectedStudent.parent_email || ''} onChange={e => setSelectedStudent({...selectedStudent, parent_email: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-outline/10">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-semibold text-on-surface hover:bg-outline/20 transition-colors">Cancel</button>
                                <button type="submit" disabled={isSavingStudent} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                                    {isSavingStudent ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MANAGE SUBJECTS REGISTRATION MODAL */}
            {showSubjectsModal && subjectStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-lg shadow-xl border border-outline/20">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-on-surface">Manage Registered Subjects</h2>
                                <p className="text-xs text-on-surface-variant mt-0.5">Student: {subjectStudent.first_name} {subjectStudent.last_name}</p>
                            </div>
                            <button onClick={() => setShowSubjectsModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl font-semibold">&times;</button>
                        </div>
                        <form onSubmit={handleSaveSubjectsSubmit} className="p-6 space-y-4">
                            {loadingSubjects ? (
                                <div className="py-12 text-center text-on-surface-variant animate-pulse">Loading subjects info...</div>
                            ) : availableSubjects.length === 0 ? (
                                <div className="py-8 text-center text-on-surface-variant">No subjects are assigned to this class level in this session.</div>
                            ) : (
                                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                                    <p className="text-xs text-on-surface-variant font-semibold">Select elective subjects to register/approve for this student. Compulsory subjects are auto-included and cannot be removed.</p>
                                    
                                    <div className="divide-y divide-outline/5 border border-outline/10 rounded-xl overflow-hidden">
                                        {availableSubjects.map((cs: any) => {
                                            const isCompulsory = cs.is_compulsory;
                                            const isChecked = isCompulsory || selectedSubjectIds.includes(cs.subject_id);
                                            return (
                                                <label 
                                                    key={cs.id} 
                                                    className={`flex items-center justify-between p-3.5 text-sm select-none cursor-pointer transition-colors ${
                                                        isCompulsory 
                                                            ? 'bg-surface-container/40 text-on-surface-variant cursor-default' 
                                                            : 'hover:bg-surface-container/50 text-on-surface'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input 
                                                            type="checkbox" 
                                                            disabled={isCompulsory}
                                                            checked={isChecked}
                                                            onChange={(e) => {
                                                                if (isCompulsory) return;
                                                                if (e.target.checked) {
                                                                    setSelectedSubjectIds(prev => [...prev, cs.subject_id]);
                                                                } else {
                                                                    setSelectedSubjectIds(prev => prev.filter(id => id !== cs.subject_id));
                                                                }
                                                            }}
                                                            className="w-4.5 h-4.5 rounded border-outline/30 text-primary focus:ring-primary cursor-pointer disabled:cursor-default" 
                                                        />
                                                        <div>
                                                            <span className="font-semibold">{cs.subject?.name}</span>
                                                            <span className="text-xs text-on-surface-variant ml-2 font-mono">{cs.subject?.code}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    {isCompulsory ? (
                                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-600 border border-green-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                            Compulsory
                                                        </span>
                                                    ) : selectedSubjectIds.includes(cs.subject_id) ? (
                                                        <span className="px-2 py-0.5 bg-sky-500/10 text-sky-600 border border-sky-500/20 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                                            Registered
                                                        </span>
                                                    ) : null}
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-4 border-t border-outline/10">
                                <button type="button" onClick={() => setShowSubjectsModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-semibold text-on-surface hover:bg-outline/20 transition-colors">Cancel</button>
                                <button type="submit" disabled={savingSubjects || loadingSubjects} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
                                    {savingSubjects ? 'Saving...' : 'Save & Approve'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
