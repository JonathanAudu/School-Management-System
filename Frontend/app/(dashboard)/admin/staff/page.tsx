'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

export default function StaffPage() {
    const [staffList, setStaffList] = useState<any[]>([]);
    const [metrics, setMetrics] = useState({ total: 0, active: 0, teaching: 0, non_teaching: 0, male: 0, female: 0 });
    const [departments, setDepartments] = useState<any[]>([]);
    
    // Filters & Pagination
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // Modals
    const [showAddModal, setShowAddModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<any>(null);
    const [activeTab, setActiveTab] = useState('profile');

    // Add Form State
    const [addForm, setAddForm] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: 'Male',
        phone: '',
        email: '',
        date_of_birth: '',
        department_id: '',
        position: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchLookups();
        fetchStaff();
    }, [page, filterDept, filterGender, filterStatus]);

    const fetchLookups = async () => {
        try {
            const res = await axios.get('/api/staff/lookups');
            setDepartments(res.data.departments);
            if (res.data.departments.length > 0) {
                setAddForm(prev => ({ ...prev, department_id: res.data.departments[0].id }));
            }
        } catch (err) {
            console.error('Failed to fetch lookups');
        }
    };

    const fetchStaff = async (searchQuery = search) => {
        try {
            const res = await axios.get('/api/staff', {
                params: {
                    page,
                    search: searchQuery,
                    department_id: filterDept,
                    gender: filterGender,
                    status: filterStatus
                }
            });
            setStaffList(res.data.staff.data);
            setTotalPages(res.data.staff.last_page);
            setMetrics(res.data.metrics);
        } catch (err) {
            toast.error('Failed to fetch staff data.');
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchStaff();
    };

    const handleAddStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await axios.post('/api/staff', addForm);
            toast.success('Staff member added successfully! An email with their setup link was sent.');
            setShowAddModal(false);
            setAddForm({ ...addForm, first_name: '', last_name: '', middle_name: '', phone: '', email: '', date_of_birth: '', position: '' });
            fetchStaff();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to add staff member.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExport = async () => {
        try {
            const res = await axios.get('/api/staff/export', {
                params: {
                    department_id: filterDept,
                    gender: filterGender,
                    status: filterStatus,
                    search: search,
                },
                responseType: 'blob',
            });
            
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'staff_export.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            toast.error('Failed to export staff data.');
        }
    };

    const viewStaffProfile = (staff: any) => {
        setSelectedStaff(staff);
        setActiveTab('profile');
        setShowViewModal(true);
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-on-surface">Staff Directory</h1>
                    <p className="text-on-surface-variant mt-1">Manage teaching and non-teaching staff</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleExport} className="px-4 py-2 bg-surface-container border border-outline/20 text-on-surface rounded-lg hover:bg-surface-container-high font-medium transition-colors flex items-center gap-2">
                        <span>📥</span> Export CSV
                    </button>
                    <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary-container font-medium transition-colors flex items-center gap-2">
                        <span>➕</span> Add New Staff
                    </button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline/10 shadow-sm">
                    <div className="text-sm font-semibold text-on-surface-variant mb-1">Total Staff</div>
                    <div className="text-3xl font-bold text-on-surface">{metrics.total}</div>
                </div>
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline/10 shadow-sm border-t-4 border-t-primary">
                    <div className="text-sm font-semibold text-on-surface-variant mb-1">Teaching</div>
                    <div className="text-3xl font-bold text-on-surface">{metrics.teaching}</div>
                </div>
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline/10 shadow-sm border-t-4 border-t-secondary">
                    <div className="text-sm font-semibold text-on-surface-variant mb-1">Non-Teaching</div>
                    <div className="text-3xl font-bold text-on-surface">{metrics.non_teaching}</div>
                </div>
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline/10 shadow-sm border-t-4 border-t-primary-container">
                    <div className="text-sm font-semibold text-on-surface-variant mb-1">Active Staff</div>
                    <div className="text-3xl font-bold text-on-surface">{metrics.active}</div>
                </div>
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline/10 shadow-sm">
                    <div className="text-sm font-semibold text-on-surface-variant mb-1">Male / Female</div>
                    <div className="text-3xl font-bold text-on-surface">{metrics.male} <span className="text-on-surface-variant text-xl">/</span> {metrics.female}</div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-surface-container p-4 rounded-t-2xl border border-outline/20 border-b-0 flex flex-col md:flex-row gap-4 justify-between items-center">
                <form onSubmit={handleSearch} className="flex-1 w-full relative">
                    <span className="absolute left-3 top-2.5 text-on-surface-variant">🔍</span>
                    <input 
                        type="text" 
                        placeholder="Search by name, ID, email or phone..." 
                        className="w-full pl-10 pr-4 py-2 border border-outline/20 bg-surface-container-low rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        suppressHydrationWarning
                    />
                </form>
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                    <select className="border border-outline/20 bg-surface-container-low rounded-lg px-3 py-2 text-sm text-on-surface" value={filterDept} onChange={e => {setFilterDept(e.target.value); setPage(1)}}>
                        <option value="">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <select className="border border-outline/20 bg-surface-container-low rounded-lg px-3 py-2 text-sm text-on-surface" value={filterGender} onChange={e => {setFilterGender(e.target.value); setPage(1)}}>
                        <option value="">All Genders</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                    <select className="border border-outline/20 bg-surface-container-low rounded-lg px-3 py-2 text-sm text-on-surface" value={filterStatus} onChange={e => {setFilterStatus(e.target.value); setPage(1)}}>
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-surface-container-low border border-outline/20 rounded-b-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-surface-container border-b border-outline/20 text-xs uppercase tracking-wider text-on-surface-variant">
                                <th className="p-4 font-semibold">Staff ID</th>
                                <th className="p-4 font-semibold">Staff Member</th>
                                <th className="p-4 font-semibold">Department & Role</th>
                                <th className="p-4 font-semibold">Contact</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline/10 text-sm">
                            {staffList.length === 0 ? (
                                <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant">No staff members found.</td></tr>
                            ) : (
                                staffList.map(staff => (
                                    <tr key={staff.id} className="hover:bg-surface-container-high transition-colors">
                                        <td className="p-4 font-medium text-on-surface">{staff.staff_id}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden flex-shrink-0">
                                                    {staff.user?.profile_picture ? (
                                                        <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${staff.user.profile_picture}`} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-bold">{staff.first_name[0]}{staff.last_name[0]}</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-on-surface">{staff.first_name} {staff.middle_name ? staff.middle_name[0]+'.' : ''} {staff.last_name}</div>
                                                    <div className="text-xs text-on-surface-variant">{staff.gender}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-medium text-on-surface">{staff.department?.name || 'Unassigned'}</div>
                                            <div className="text-xs text-on-surface-variant">{staff.position || '-'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="text-on-surface">{staff.phone}</div>
                                            <div className="text-xs text-on-surface-variant">{staff.email}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-medium ${staff.status === 'Active' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                                                {staff.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex gap-2">
                                                <button onClick={() => viewStaffProfile(staff)} className="text-primary hover:text-primary-container font-medium text-sm transition-colors">View Profile</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm">
                    <span className="text-slate-500">Page {page} of {totalPages}</span>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage(page-1)} className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Previous</button>
                        <button disabled={page === totalPages} onClick={() => setPage(page+1)} className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>

            {/* Add Staff Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-outline/20">
                        <div className="p-6 border-b border-outline/10 flex justify-between items-center sticky top-0 bg-surface-container z-10">
                            <h2 className="text-xl font-bold font-serif text-on-surface">Add New Staff</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleAddStaff} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">First Name *</label>
                                    <input type="text" required className="w-full px-4 py-2 bg-surface-container-highest border border-outline/20 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.first_name} onChange={e => setAddForm({...addForm, first_name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Last Name *</label>
                                    <input type="text" required className="w-full px-4 py-2 bg-surface-container-highest border border-outline/20 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.last_name} onChange={e => setAddForm({...addForm, last_name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Middle Name</label>
                                    <input type="text" className="w-full px-4 py-2 bg-surface-container-highest border border-outline/20 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.middle_name} onChange={e => setAddForm({...addForm, middle_name: e.target.value})} />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Email Address *</label>
                                    <input type="email" required className="w-full px-4 py-2 bg-surface-container-highest border border-outline/20 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.email} onChange={e => setAddForm({...addForm, email: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Phone Number *</label>
                                    <input type="text" required className="w-full px-4 py-2 bg-surface-container-highest border border-outline/20 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Date of Birth *</label>
                                    <input type="date" required className="w-full px-4 py-2 bg-surface-container-highest border border-outline/20 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.date_of_birth} onChange={e => setAddForm({...addForm, date_of_birth: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Gender *</label>
                                    <select required className="w-full px-4 py-2 bg-surface-container-highest border border-outline/20 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface appearance-none" value={addForm.gender} onChange={e => setAddForm({...addForm, gender: e.target.value})}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-outline/10 pt-6">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Department *</label>
                                    <select required className="w-full px-4 py-2 bg-surface-container-highest border border-outline/20 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface appearance-none" value={addForm.department_id} onChange={e => setAddForm({...addForm, department_id: e.target.value})}>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface-variant mb-1">Position / Designation</label>
                                    <input type="text" placeholder="e.g. Senior Math Teacher" className="w-full px-4 py-2 bg-surface-container-highest border border-outline/20 rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface" value={addForm.position} onChange={e => setAddForm({...addForm, position: e.target.value})} />
                                </div>
                            </div>

                            <div className="bg-primary/10 text-primary p-4 rounded-xl text-sm flex gap-3 border border-primary/20">
                                <span>ℹ️</span>
                                <div>Upon creation, an automatic email will be sent to the staff member containing a link to securely set up their password and profile.</div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-outline/10">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-outline/20 text-on-surface-variant rounded-xl font-medium hover:bg-surface-container-highest transition-colors">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-70">
                                    {isSubmitting ? 'Creating...' : 'Create Staff Member'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Profile Modal */}
            {showViewModal && selectedStaff && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-outline/20">
                        <div className="p-6 border-b border-outline/10 flex justify-between items-start bg-surface-container">
                            <div className="flex gap-4 items-center">
                                <div className="w-16 h-16 rounded-full bg-surface-container-highest border border-outline/20 overflow-hidden flex-shrink-0 shadow-sm">
                                    {selectedStaff.user?.profile_picture ? (
                                        <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${selectedStaff.user.profile_picture}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-bold text-xl">{selectedStaff.first_name[0]}{selectedStaff.last_name[0]}</div>
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-on-surface">{selectedStaff.first_name} {selectedStaff.middle_name} {selectedStaff.last_name}</h2>
                                    <p className="text-on-surface-variant text-sm font-medium">{selectedStaff.position || 'No Designation'} • {selectedStaff.department?.name}</p>
                                    <div className="mt-1 flex gap-2 text-xs">
                                        <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface rounded-md font-mono border border-outline/10">{selectedStaff.staff_id}</span>
                                        <span className={`px-2 py-0.5 rounded-md font-medium border ${selectedStaff.status === 'Active' ? 'bg-green-500/20 text-green-600 border-green-500/20 dark:text-green-400' : 'bg-red-500/20 text-red-600 border-red-500/20 dark:text-red-400'}`}>{selectedStaff.status}</span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowViewModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl transition-colors">&times;</button>
                        </div>
                        
                        <div className="flex border-b border-outline/10 px-6 pt-4 gap-6 text-sm font-medium bg-surface-container">
                            <button onClick={() => setActiveTab('profile')} className={`pb-3 border-b-2 transition-colors ${activeTab === 'profile' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Profile Info</button>
                            <button onClick={() => setActiveTab('roles')} className={`pb-3 border-b-2 transition-colors ${activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Assigned Roles</button>
                            <button onClick={() => setActiveTab('subjects')} className={`pb-3 border-b-2 transition-colors ${activeTab === 'subjects' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Subjects & Classes</button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 bg-surface-container-low">
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                                        <div><div className="text-on-surface-variant mb-1">Email Address</div><div className="font-medium text-on-surface">{selectedStaff.email}</div></div>
                                        <div><div className="text-on-surface-variant mb-1">Phone Number</div><div className="font-medium text-on-surface">{selectedStaff.phone}</div></div>
                                        <div><div className="text-on-surface-variant mb-1">Gender</div><div className="font-medium text-on-surface">{selectedStaff.gender}</div></div>
                                        <div><div className="text-on-surface-variant mb-1">Date of Birth</div><div className="font-medium text-on-surface">{selectedStaff.date_of_birth}</div></div>
                                    </div>
                                </div>
                            )}
                            
                            {activeTab === 'roles' && (
                                <div className="text-center py-10 bg-surface-container rounded-xl border border-dashed border-outline/20">
                                    <div className="text-4xl mb-3">🛡️</div>
                                    <h3 className="font-bold text-on-surface mb-2">Role Management</h3>
                                    <p className="text-sm text-on-surface-variant max-w-sm mx-auto">This module will allow assigning specific system roles (Admin, Teacher, Accountant, etc.) to staff members. Coming soon.</p>
                                </div>
                            )}

                            {activeTab === 'subjects' && (
                                <div>
                                    <h3 className="font-bold text-on-surface mb-4">Classes Assigned (Form Master)</h3>
                                    {selectedStaff.classes && selectedStaff.classes.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                            {selectedStaff.classes.map((cls: any) => (
                                                <div key={cls.id} className="bg-surface-container border border-outline/10 p-4 rounded-xl flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-primary">{cls.full_name}</div>
                                                        <div className="text-xs text-on-surface-variant mt-1">Room: {cls.room_number || 'N/A'}</div>
                                                    </div>
                                                    <span className={`text-xs px-2 py-1 rounded-md font-semibold ${cls.is_active ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'}`}>
                                                        {cls.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6 bg-surface-container rounded-xl border border-dashed border-outline/20 mb-8">
                                            <p className="text-sm text-on-surface-variant">This staff member is not currently assigned as a Class Teacher.</p>
                                        </div>
                                    )}

                                    <h3 className="font-bold text-on-surface mb-4">Subject Assignments</h3>
                                    {selectedStaff.class_subjects && selectedStaff.class_subjects.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {selectedStaff.class_subjects.map((cs: any) => (
                                                <div key={cs.id} className="bg-surface-container border border-outline/10 p-4 rounded-xl flex flex-col justify-between">
                                                    <div>
                                                        <div className="font-bold text-primary">{cs.subject?.name || 'Unknown Subject'}</div>
                                                        <div className="text-sm text-on-surface mt-1">{cs.school_class?.full_name || 'Unknown Class'}</div>
                                                        <div className="text-xs text-on-surface-variant mt-1">Session: {cs.academic_session?.name || 'N/A'}</div>
                                                    </div>
                                                    <div className="mt-3 flex justify-between items-center">
                                                        <span className={`text-xs px-2 py-1 rounded-md font-semibold ${cs.is_compulsory ? 'bg-sky-500/10 text-sky-600' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                                                            {cs.is_compulsory ? 'Compulsory' : 'Elective'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-surface-container rounded-xl border border-dashed border-outline/20">
                                            <div className="text-4xl mb-3 opacity-50">📚</div>
                                            <p className="text-sm text-on-surface-variant">No subjects currently assigned to this staff member.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
