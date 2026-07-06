'use client';

import { useState, useEffect, Suspense } from 'react';
import axios from '@/lib/axios';
import { Toaster, toast } from 'react-hot-toast';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
function StudentsManagementContent() {
    const searchParams = useSearchParams();
    const [students, setStudents] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({ total: 0, active: 0, male: 0, female: 0 });
    const [lookups, setLookups] = useState<{ sessions: any[], terms: any[], classes: any[] }>({ sessions: [], terms: [], classes: [] });
    
    // Filters
    const [search, setSearch] = useState('');
    const [filterClass, setFilterClass] = useState(searchParams.get('class') || '');
    const [filterSession, setFilterSession] = useState('');

    // Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Modals
    const [showSingleModal, setShowSingleModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [viewStudent, setViewStudent] = useState<any>(null);

    // Form States
    const [singleForm, setSingleForm] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        student_email: '',
        class: '', arm: '', gender: '', academic_session_id: '', term_id: '', parent_name: '', parent_email: '', parent_phone: ''
    });

    const [bulkForm, setBulkForm] = useState({
        academic_session_id: '', term_id: '', class: '', arm: ''
    });
    const [bulkFile, setBulkFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchLookups();
    }, []);

    useEffect(() => {
        fetchStudents();
    }, [page, search, filterClass, filterSession]);

    const fetchLookups = async () => {
        try {
            const res = await axios.get('/api/lookups');
            setLookups(res.data);
            if (res.data.sessions.length > 0) {
                const currentSession = res.data.sessions.find((s: any) => s.status === 'active') || res.data.sessions[0];
                if (currentSession) {
                    setFilterSession(currentSession.id.toString());
                    setSingleForm(prev => ({ ...prev, academic_session_id: currentSession.id.toString() }));
                    setBulkForm(prev => ({ ...prev, academic_session_id: currentSession.id.toString() }));
                }
            }
            if (res.data.terms.length > 0) {
                const currentTerm = res.data.terms.find((t: any) => t.is_current) || res.data.terms[0];
                if (currentTerm) {
                    setSingleForm(prev => ({ ...prev, term_id: currentTerm.id.toString() }));
                    setBulkForm(prev => ({ ...prev, term_id: currentTerm.id.toString() }));
                }
            }
        } catch (err) {
            console.error('Failed to load lookups', err);
        }
    };

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/students', {
                params: {
                    page,
                    search,
                    class: filterClass,
                    session_id: filterSession
                }
            });
            setStudents(res.data.students.data);
            setTotalPages(res.data.students.last_page);
            setMetrics(res.data.metrics);
        } catch (err) {
            console.error('Failed to load students', err);
        }
    };

    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/students', singleForm);
            setShowSingleModal(false);
            fetchStudents();
            setSingleForm({ ...singleForm, first_name: '', last_name: '', middle_name: '', student_email: '', parent_name: '', parent_email: '', parent_phone: '' }); // reset names
            toast.success('Student added successfully!');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add student. Please check all required fields.');
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.put(`/api/students/${selectedStudent.id}`, selectedStudent);
            setShowEditModal(false);
            fetchStudents();
            toast.success('Student updated successfully!');
        } catch (err) {
            toast.error('Failed to update student.');
        }
    };

    const handleBulkSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!bulkFile) return toast.error("Please select a file.");
        setUploading(true);

        const formData = new FormData();
        formData.append('file', bulkFile);
        formData.append('academic_session_id', bulkForm.academic_session_id);
        formData.append('term_id', bulkForm.term_id);
        formData.append('class', bulkForm.class);
        formData.append('arm', bulkForm.arm);

        try {
            const res = await axios.post('/api/students/bulk', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success(res.data.message);
            setShowBulkModal(false);
            fetchStudents();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Bulk upload failed.');
        } finally {
            setUploading(false);
            setBulkFile(null);
        }
    };

    const handleDownloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,First Name,Last Name,Middle Name,Student Email,Parent Name,Parent Email,Parent Phone\nJohn,Doe,Alexander,john@example.com,Mr. Doe,parent@example.com,08012345678\nJane,Smith,,jane@example.com,Mrs. Smith,smith@example.com,08087654321\n";
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_bulk_upload_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportCSV = async () => {
        try {
            toast.loading('Preparing export...', { id: 'export-toast' });
            const query = new URLSearchParams({
                search,
                class: filterClass,
                session_id: filterSession
            }).toString();
            
            const res = await axios.get(`/api/students/export?${query}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'students_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success('Export successful!', { id: 'export-toast' });
        } catch (err) {
            toast.error('Failed to export students.', { id: 'export-toast' });
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <Toaster position="top-right" />
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-on-surface">Students Directory</h1>
                    <p className="text-on-surface-variant mt-1">Manage enrollments, view academic records, and bulk upload students.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowSingleModal(true)} className="btn-primary bg-white text-sky-600 border border-sky-200 hover:bg-sky-50 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors">
                        + Single Student
                    </button>
                    <button onClick={() => setShowBulkModal(true)} className="btn-primary bg-sky-600 text-white hover:bg-sky-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                        <span>⬆️</span> Bulk Upload
                    </button>
                </div>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline/10 shadow-sm">
                    <span className="text-on-surface-variant text-sm font-semibold mb-2 flex items-center gap-2">👨‍🎓 Total Enrolled</span>
                    <span className="text-3xl font-bold text-on-surface">{metrics.total}</span>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline/10 shadow-sm">
                    <span className="text-on-surface-variant text-sm font-semibold mb-2 flex items-center gap-2">👨 Male</span>
                    <span className="text-3xl font-bold text-on-surface">{metrics.male}</span>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline/10 shadow-sm">
                    <span className="text-on-surface-variant text-sm font-semibold mb-2 flex items-center gap-2">👩 Female</span>
                    <span className="text-3xl font-bold text-on-surface">{metrics.female}</span>
                </div>
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline/10 shadow-sm">
                    <span className="text-on-surface-variant text-sm font-semibold mb-2 flex items-center gap-2">✅ Active</span>
                    <span className="text-3xl font-bold text-on-surface">{metrics.active}</span>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-surface-container p-4 rounded-t-2xl border-x border-t border-outline/20 flex flex-col md:flex-row gap-4 justify-between items-center">
                <input 
                    type="text" 
                    placeholder="Search by name or Admission No..." 
                    className="w-full md:w-96 px-4 py-2 bg-surface-container-low border border-outline/20 rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
                <div className="flex gap-4 w-full md:w-auto">
                    <select 
                        className="px-4 py-2 bg-surface-container-low border border-outline/20 rounded-lg text-sm text-on-surface w-full md:w-auto"
                        value={filterSession}
                        onChange={(e) => setFilterSession(e.target.value)}
                    >
                        <option value="">All Sessions</option>
                        {lookups.sessions.map((s: any) => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                    </select>
                    <select 
                        className="px-4 py-2 bg-surface-container-low border border-outline/20 rounded-lg text-sm text-on-surface w-full md:w-auto"
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                    >
                        <option value="">All Classes</option>
                        {Array.from(new Set(lookups.classes.map(c => c.level_name))).map(cls => (
                            <option key={cls} value={cls}>{cls}</option>
                        ))}
                    </select>
                    <button onClick={handleExportCSV} className="px-4 py-2 bg-surface-container-highest text-on-surface hover:bg-surface-bright rounded-lg text-sm font-semibold transition-colors flex items-center gap-2">
                        ⬇️ Export CSV
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-container-low border border-outline/20 rounded-b-2xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-container border-b border-outline/20 text-on-surface-variant text-sm font-semibold">
                            <th className="py-4 px-6">Admission No</th>
                            <th className="py-4 px-6">Name</th>
                            <th className="py-4 px-6">Class/Arm</th>
                            <th className="py-4 px-6">Gender</th>
                            <th className="py-4 px-6">Status</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.length === 0 ? (
                            <tr><td colSpan={6} className="py-8 text-center text-on-surface-variant">No students found.</td></tr>
                        ) : (
                            students.map(s => (
                                <tr key={s.id} className="border-b border-outline/10 hover:bg-surface-container-high transition-colors">
                                    <td className="py-4 px-6 font-medium text-on-surface">{s.admission_number}</td>
                                    <td className="py-4 px-6">
                                        <div className="font-semibold text-on-surface">{s.first_name} {s.middle_name ? s.middle_name + ' ' : ''}{s.last_name}</div>
                                        <div className="text-xs text-on-surface-variant">Admitted: {s.date_admitted}</div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="px-2 py-1 bg-primary/10 text-primary font-bold text-xs rounded-md border border-primary/20">{s.class} - {s.arm}</span>
                                    </td>
                                    <td className="py-4 px-6 text-sm text-on-surface-variant">{s.gender || 'N/A'}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.status === 'Active' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <button onClick={() => { setViewStudent(s); setShowViewModal(true); }} className="text-primary hover:text-primary-container text-sm font-semibold mr-3 transition-colors">View</button>
                                        <button onClick={() => { setSelectedStudent(s); setShowEditModal(true); }} className="text-sky-600 dark:text-sky-400 hover:opacity-80 text-sm font-semibold transition-colors">Edit</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination Placeholder */}
            {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center text-sm text-slate-600">
                    <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50">Next</button>
                </div>
            )}

            {/* SINGLE STUDENT MODAL */}
            {showSingleModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-lg shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-on-surface">Add Single Student</h2>
                            <button onClick={() => setShowSingleModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSingleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">First Name *</label>
                                    <input type="text" required value={singleForm.first_name} onChange={e => setSingleForm({...singleForm, first_name: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Last Name *</label>
                                    <input type="text" required value={singleForm.last_name} onChange={e => setSingleForm({...singleForm, last_name: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-on-surface mb-1">Middle Name (Optional)</label>
                                        <input type="text" className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" value={singleForm.middle_name} onChange={(e) => setSingleForm({ ...singleForm, middle_name: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-on-surface mb-1">Student Email</label>
                                        <input type="email" required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" value={singleForm.student_email} onChange={(e) => setSingleForm({ ...singleForm, student_email: e.target.value })} />
                                    </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Gender *</label>
                                    <select required value={singleForm.gender} onChange={e => setSingleForm({...singleForm, gender: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-outline/10 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Class *</label>
                                    <select required value={singleForm.class} onChange={e => {
                                        const currentSession = lookups.sessions.find(s => s.status === 'active') || lookups.sessions[0];
                                        const currentTerm = lookups.terms.find(t => t.is_current) || lookups.terms[0];
                                        setSingleForm({
                                            ...singleForm, 
                                            class: e.target.value, 
                                            arm: '',
                                            academic_session_id: currentSession ? currentSession.id.toString() : singleForm.academic_session_id,
                                            term_id: currentTerm ? currentTerm.id.toString() : singleForm.term_id
                                        });
                                    }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select Class...</option>
                                        {Array.from(new Set(lookups.classes.map(c => c.level_name))).map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Arm *</label>
                                    <select required value={singleForm.arm} onChange={e => setSingleForm({...singleForm, arm: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" disabled={!singleForm.class}>
                                        <option value="">Select Arm...</option>
                                        {lookups.classes.filter(c => c.level_name === singleForm.class).map(c => (
                                            <option key={c.id} value={c.arm_name}>{c.arm_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-outline/10 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Parent Name</label>
                                    <input type="text" value={singleForm.parent_name} onChange={e => setSingleForm({...singleForm, parent_name: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Parent Phone</label>
                                    <input type="text" value={singleForm.parent_phone} onChange={e => setSingleForm({...singleForm, parent_phone: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-b border-outline/10 pb-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-on-surface mb-1">Parent Email</label>
                                    <input type="email" value={singleForm.parent_email} onChange={e => setSingleForm({...singleForm, parent_email: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Session *</label>
                                    <select required value={singleForm.academic_session_id} onChange={e => {
                                        const sessId = e.target.value;
                                        const matchingTerm = lookups.terms.find((t: any) => t.academic_session_id === Number(sessId));
                                        setSingleForm({
                                            ...singleForm,
                                            academic_session_id: sessId,
                                            term_id: matchingTerm ? matchingTerm.id.toString() : ''
                                        });
                                    }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select...</option>
                                        {lookups.sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Term *</label>
                                    <select required value={singleForm.term_id} onChange={e => setSingleForm({...singleForm, term_id: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select...</option>
                                        {lookups.terms
                                            .filter((t: any) => !singleForm.academic_session_id || t.academic_session_id === Number(singleForm.academic_session_id))
                                            .map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowSingleModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface hover:bg-outline/20 transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors">Save Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* BULK UPLOAD MODAL */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-lg shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-on-surface">Mass / Bulk Upload</h2>
                                <p className="text-sm text-on-surface-variant mt-1">Upload a CSV file containing: First Name, Last Name, Middle Name.</p>
                            </div>
                            <button onClick={() => setShowBulkModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        
                        <form onSubmit={handleBulkSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Target Class *</label>
                                    <select required value={bulkForm.class} onChange={e => {
                                        const currentSession = lookups.sessions.find(s => s.status === 'active') || lookups.sessions[0];
                                        const currentTerm = lookups.terms.find(t => t.is_current) || lookups.terms[0];
                                        setBulkForm({
                                            ...bulkForm, 
                                            class: e.target.value, 
                                            arm: '',
                                            academic_session_id: currentSession ? currentSession.id.toString() : bulkForm.academic_session_id,
                                            term_id: currentTerm ? currentTerm.id.toString() : bulkForm.term_id
                                        });
                                    }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select Class...</option>
                                        {Array.from(new Set(lookups.classes.map(c => c.level_name))).map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Target Arm *</label>
                                    <select required value={bulkForm.arm} onChange={e => setBulkForm({...bulkForm, arm: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" disabled={!bulkForm.class}>
                                        <option value="">Select Arm...</option>
                                        {lookups.classes.filter(c => c.level_name === bulkForm.class).map(c => (
                                            <option key={c.id} value={c.arm_name}>{c.arm_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Session *</label>
                                    <select required value={bulkForm.academic_session_id} onChange={e => {
                                        const sessId = e.target.value;
                                        const matchingTerm = lookups.terms.find((t: any) => t.academic_session_id === Number(sessId));
                                        setBulkForm({
                                            ...bulkForm,
                                            academic_session_id: sessId,
                                            term_id: matchingTerm ? matchingTerm.id.toString() : ''
                                        });
                                    }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select...</option>
                                        {lookups.sessions.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Term *</label>
                                    <select required value={bulkForm.term_id} onChange={e => setBulkForm({...bulkForm, term_id: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select...</option>
                                        {lookups.terms
                                            .filter((t: any) => !bulkForm.academic_session_id || t.academic_session_id === Number(bulkForm.academic_session_id))
                                            .map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 border-2 border-dashed border-outline/20 rounded-xl p-8 text-center bg-surface-container-highest hover:bg-outline/10 transition-colors cursor-pointer relative">
                                <input type="file" required accept=".csv" onChange={(e) => setBulkFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="text-4xl mb-2">📄</div>
                                <div className="font-medium text-on-surface">{bulkFile ? bulkFile.name : 'Click to select CSV File'}</div>
                                <div className="text-xs text-on-surface-variant mt-1">First Name | Last Name | Middle Name | Student Email | Parent Name | Parent Email | Parent Phone</div>
                            </div>
                            
                            <div className="text-right mt-2">
                                <button type="button" onClick={handleDownloadTemplate} className="text-primary hover:text-primary-container text-sm font-medium underline transition-colors">
                                    Download CSV Template
                                </button>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-outline/10">
                                <button type="button" onClick={() => setShowBulkModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface hover:bg-outline/20 transition-colors">Cancel</button>
                                <button type="submit" disabled={uploading} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                                    {uploading ? 'Processing...' : 'Upload & Generate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* VIEW STUDENT MODAL */}
            {showViewModal && viewStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-outline/20">
                        <button onClick={() => setShowViewModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface text-xl transition-colors">&times;</button>
                        <div className="flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-highest border-4 border-surface-container-low shadow-lg mb-4 flex items-center justify-center text-3xl font-bold text-on-surface-variant">
                                {viewStudent.user?.profile_picture ? (
                                    <img src={viewStudent.user.profile_picture} alt={viewStudent.first_name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{viewStudent.first_name.charAt(0)}</span>
                                )}
                            </div>
                            <h2 className="text-2xl font-bold font-serif text-on-surface">{viewStudent.first_name} {viewStudent.middle_name ? viewStudent.middle_name + ' ' : ''}{viewStudent.last_name}</h2>
                            <p className="text-primary font-semibold mb-6">{viewStudent.admission_number}</p>
                            
                            <div className="w-full grid grid-cols-2 gap-4 text-left border-t pt-4 border-outline/10">
                                <div><span className="block text-xs text-on-surface-variant uppercase font-bold">Class & Arm</span><span className="font-semibold text-on-surface">{viewStudent.class} - {viewStudent.arm}</span></div>
                                <div><span className="block text-xs text-on-surface-variant uppercase font-bold">Gender</span><span className="font-semibold text-on-surface">{viewStudent.gender || 'N/A'}</span></div>
                                <div><span className="block text-xs text-on-surface-variant uppercase font-bold">Session</span><span className="font-semibold text-on-surface">{viewStudent.academic_session?.name}</span></div>
                                <div><span className="block text-xs text-on-surface-variant uppercase font-bold">Term</span><span className="font-semibold text-on-surface">{viewStudent.term?.name}</span></div>
                                <div><span className="block text-xs text-on-surface-variant uppercase font-bold">Status</span><span className={`font-semibold ${viewStudent.status === 'Active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{viewStudent.status}</span></div>
                                <div><span className="block text-xs text-on-surface-variant uppercase font-bold">Date Admitted</span><span className="font-semibold text-on-surface">{viewStudent.date_admitted}</span></div>
                                <div className="col-span-2 border-t mt-2 pt-2 border-outline/10"></div>
                                <div><span className="block text-xs text-on-surface-variant uppercase font-bold">Parent / Guardian</span><span className="font-semibold text-on-surface">{viewStudent.parent_name || 'N/A'}</span></div>
                                <div><span className="block text-xs text-on-surface-variant uppercase font-bold">Parent Phone</span><span className="font-semibold text-on-surface">{viewStudent.parent_phone || 'N/A'}</span></div>
                                <div className="col-span-2"><span className="block text-xs text-on-surface-variant uppercase font-bold">Parent Email</span><span className="font-semibold text-on-surface">{viewStudent.parent_email || 'N/A'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showEditModal && selectedStudent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-lg shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-on-surface">Edit Student</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">First Name *</label>
                                    <input type="text" required value={selectedStudent.first_name} onChange={e => setSelectedStudent({...selectedStudent, first_name: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Last Name *</label>
                                    <input type="text" required value={selectedStudent.last_name} onChange={e => setSelectedStudent({...selectedStudent, last_name: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Middle Name</label>
                                    <input type="text" value={selectedStudent.middle_name || ''} onChange={e => setSelectedStudent({...selectedStudent, middle_name: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Gender *</label>
                                    <select required value={selectedStudent.gender || ''} onChange={e => setSelectedStudent({...selectedStudent, gender: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select...</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-outline/10 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Class *</label>
                                    <select required value={selectedStudent.class || ''} onChange={e => {
                                        const currentSession = lookups.sessions.find(s => s.status === 'active');
                                        const currentTerm = lookups.terms.find(t => t.is_current);
                                        setSelectedStudent({
                                            ...selectedStudent, 
                                            class: e.target.value, 
                                            arm: '',
                                            academic_session_id: currentSession ? currentSession.id.toString() : selectedStudent.academic_session_id,
                                            term_id: currentTerm ? currentTerm.id.toString() : selectedStudent.term_id
                                        });
                                    }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                        <option value="">Select Class...</option>
                                        {Array.from(new Set(lookups.classes.map(c => c.level_name))).map(cls => (
                                            <option key={cls} value={cls}>{cls}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Arm *</label>
                                    <select required value={selectedStudent.arm || ''} onChange={e => setSelectedStudent({...selectedStudent, arm: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" disabled={!selectedStudent.class}>
                                        <option value="">Select Arm...</option>
                                        {lookups.classes.filter(c => c.level_name === selectedStudent.class).map(c => (
                                            <option key={c.id} value={c.arm_name}>{c.arm_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Status *</label>
                                <select required value={selectedStudent.status} onChange={e => setSelectedStudent({...selectedStudent, status: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary">
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Graduated">Graduated</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-t border-outline/10 pt-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Parent Name</label>
                                    <input type="text" value={selectedStudent.parent_name || ''} onChange={e => setSelectedStudent({...selectedStudent, parent_name: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Parent Phone</label>
                                    <input type="text" value={selectedStudent.parent_phone || ''} onChange={e => setSelectedStudent({...selectedStudent, parent_phone: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 border-b border-outline/10 pb-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-medium text-on-surface mb-1">Parent Email</label>
                                    <input type="email" value={selectedStudent.parent_email || ''} onChange={e => setSelectedStudent({...selectedStudent, parent_email: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface focus:outline-none focus:ring-2 focus:ring-primary" />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface hover:bg-outline/20 transition-colors">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors">Update Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function StudentsManagement() {
    return (
        <Suspense fallback={<div className="p-6 text-center text-on-surface-variant">Loading...</div>}>
            <StudentsManagementContent />
        </Suspense>
    );
}
