'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import Link from 'next/link';

export default function ClassesManagement() {
    const [classes, setClasses] = useState<any[]>([]);
    const [staff, setStaff] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [editingClass, setEditingClass] = useState<any>(null);
    const [deleteModalConfig, setDeleteModalConfig] = useState<{isOpen: boolean, id: number}>({ isOpen: false, id: 0 });

    const [form, setForm] = useState({ 
        level_name: '', 
        arm_name: '', 
        capacity: 30, 
        teacher_id: '', 
        room_number: '', 
        is_active: true 
    });

    const [bulkForm, setBulkForm] = useState({
        level_name: '',
        arm_names: '', // User will type comma separated
        capacity: 30
    });

    useEffect(() => {
        fetchClasses();
        fetchStaff();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await axios.get('/api/school-classes');
            setClasses(res.data.school_classes);
        } catch (err) {
            toast.error('Failed to load classes');
        }
    };

    const fetchStaff = async () => {
        try {
            const res = await axios.get('/api/staff');
            const staffData = res.data.staff;
            setStaff(Array.isArray(staffData) ? staffData : (staffData?.data || []));
        } catch (err) {
            // Silently handle
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const payload = { ...form, teacher_id: form.teacher_id ? parseInt(form.teacher_id) : null };
            if (editingClass) {
                await axios.put(`/api/school-classes/${editingClass.id}`, payload);
                toast.success('Class updated successfully');
            } else {
                await axios.post('/api/school-classes', payload);
                toast.success('Class created successfully');
            }
            setShowModal(false);
            fetchClasses();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save class');
        }
    };

    const handleBulkSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const armNamesArray = bulkForm.arm_names.split(',').map(name => name.trim()).filter(name => name !== '');
            if (armNamesArray.length === 0) {
                toast.error('Please provide at least one arm name');
                return;
            }

            const payload = {
                level_name: bulkForm.level_name,
                arm_names: armNamesArray,
                capacity: bulkForm.capacity
            };

            const res = await axios.post('/api/school-classes/bulk', payload);
            toast.success(res.data.message);
            setShowBulkModal(false);
            fetchClasses();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to create classes');
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/api/school-classes/${deleteModalConfig.id}`);
            toast.success('Class deleted');
            fetchClasses();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete class');
        } finally {
            setDeleteModalConfig({ isOpen: false, id: 0 });
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/admin/academics" className="p-2 hover:bg-surface-container-high rounded-full transition-colors">
                    <span className="text-xl">&larr;</span>
                </Link>
                <div className="flex-1 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-serif text-on-surface">Classes & Forms</h1>
                        <p className="text-on-surface-variant mt-1">Manage school classes, arms, and assign teachers.</p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={() => { 
                                setBulkForm({ level_name: '', arm_names: '', capacity: 30 }); 
                                setShowBulkModal(true); 
                            }} 
                            className="px-4 py-2 bg-surface-container-highest text-on-surface hover:bg-outline/20 rounded-lg text-sm font-medium transition-colors"
                        >
                            Bulk Create
                        </button>
                        <button 
                            onClick={() => { 
                                setEditingClass(null); 
                                setForm({ level_name: '', arm_name: '', capacity: 30, teacher_id: '', room_number: '', is_active: true }); 
                                setShowModal(true); 
                            }} 
                            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium transition-colors hover:bg-primary/90"
                        >
                            Add Class
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {classes.map((cls) => (
                    <div key={cls.id} className="bg-surface-container-low border border-outline/20 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden group">
                        {!cls.is_active && (
                            <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-bl-lg">Inactive</div>
                        )}
                        <h3 className="text-2xl font-bold font-serif text-on-surface mb-1 group-hover:text-primary transition-colors">
                            {cls.full_name}
                        </h3>
                        <p className="text-sm text-on-surface-variant mb-4 border-b border-outline/10 pb-4">
                            Level: {cls.level_name} | Arm: {cls.arm_name}
                        </p>
                        
                        <div className="space-y-2 mb-6 flex-1 text-sm text-on-surface">
                            <div className="flex items-center gap-2">
                                <span className="text-outline">👨‍🏫</span> 
                                <span className="truncate">Teacher: {cls.teacher ? `${cls.teacher.first_name} ${cls.teacher.last_name}` : 'Unassigned'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-outline">👥</span> 
                                <span>Capacity: {cls.capacity}</span>
                            </div>
                            {cls.room_number && (
                                <div className="flex items-center gap-2">
                                    <span className="text-outline">🚪</span> 
                                    <span>Room: {cls.room_number}</span>
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mt-auto">
                            <Link href={`/admin/academics/classes/${cls.id}`} className="flex-1 text-center py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors">
                                Dashboard
                            </Link>
                            <button 
                                onClick={() => { 
                                    setEditingClass(cls); 
                                    setForm({ 
                                        level_name: cls.level_name, 
                                        arm_name: cls.arm_name, 
                                        capacity: cls.capacity, 
                                        teacher_id: cls.teacher_id?.toString() || '', 
                                        room_number: cls.room_number || '', 
                                        is_active: cls.is_active 
                                    }); 
                                    setShowModal(true); 
                                }} 
                                className="px-3 py-2 bg-surface-container-highest rounded-lg text-sm hover:bg-outline/20 transition-colors"
                                title="Edit"
                            >
                                ✏️
                            </button>
                            <button 
                                onClick={() => setDeleteModalConfig({ isOpen: true, id: cls.id })} 
                                className="px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm hover:bg-red-500/20 transition-colors"
                                title="Delete"
                            >
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
                {classes.length === 0 && (
                    <div className="col-span-full py-16 text-center text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline/10 border-dashed">
                        No classes found. Use 'Add Class' or 'Bulk Create' to get started.
                    </div>
                )}
            </div>

            {/* Single Edit/Add Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-lg shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-on-surface">{editingClass ? 'Edit Class' : 'Add Class'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Level Name *</label>
                                    <input type="text" value={form.level_name} onChange={e => setForm({...form, level_name: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" placeholder="e.g. JSS1 or Year 7" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Arm Name *</label>
                                    <input type="text" value={form.arm_name} onChange={e => setForm({...form, arm_name: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" placeholder="e.g. A or Diamond" />
                                </div>
                            </div>
                            
                            <div className="p-3 bg-surface-container-highest rounded-lg mb-4 text-center">
                                <span className="text-xs text-on-surface-variant uppercase tracking-wider block mb-1">Generated Full Name</span>
                                <span className="font-bold text-lg text-primary">{form.level_name} {form.arm_name}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Capacity</label>
                                    <input type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Room Number</label>
                                    <input type="text" value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" placeholder="e.g. Block A1" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Class Teacher</label>
                                <select 
                                    value={form.teacher_id} 
                                    onChange={e => setForm({...form, teacher_id: e.target.value})} 
                                    className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface"
                                >
                                    <option value="">Unassigned</option>
                                    {staff.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.first_name} {member.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <input 
                                    type="checkbox" 
                                    id="is_active" 
                                    checked={form.is_active} 
                                    onChange={e => setForm({...form, is_active: e.target.checked})} 
                                    className="w-4 h-4 text-primary bg-surface border-outline/20 rounded focus:ring-primary focus:ring-2"
                                />
                                <label htmlFor="is_active" className="text-sm font-medium text-on-surface">Active Class</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium">Save Class</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Bulk Create Modal */}
            {showBulkModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-lg shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-on-surface">Bulk Create Classes</h2>
                            <button onClick={() => setShowBulkModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleBulkSave} className="p-6 space-y-4">
                            <div className="bg-blue-500/10 text-blue-500 p-4 rounded-lg text-sm mb-4">
                                Create multiple arms for a specific class level at once. E.g. enter "JSS1" and arms "A, B, C" to create JSS1 A, JSS1 B, and JSS1 C.
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Level Name *</label>
                                <input type="text" value={bulkForm.level_name} onChange={e => setBulkForm({...bulkForm, level_name: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" placeholder="e.g. JSS1 or Year 7" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Arms (Comma Separated) *</label>
                                <input type="text" value={bulkForm.arm_names} onChange={e => setBulkForm({...bulkForm, arm_names: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" placeholder="e.g. Diamond, Gold, Silver OR A, B, C" />
                            </div>

                            {bulkForm.level_name && bulkForm.arm_names && (
                                <div className="p-3 bg-surface-container-highest rounded-lg mb-4">
                                    <span className="text-xs text-on-surface-variant uppercase tracking-wider block mb-2">Preview</span>
                                    <ul className="list-disc pl-5 text-sm font-medium">
                                        {bulkForm.arm_names.split(',').map(n => n.trim()).filter(n => n !== '').map((arm, idx) => (
                                            <li key={idx}>{bulkForm.level_name} {arm}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Default Capacity</label>
                                <input type="number" min="1" value={bulkForm.capacity} onChange={e => setBulkForm({...bulkForm, capacity: parseInt(e.target.value)})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                            </div>
                            
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowBulkModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium">Create All</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal 
                isOpen={deleteModalConfig.isOpen} 
                onClose={() => setDeleteModalConfig({ isOpen: false, id: 0 })} 
                onConfirm={confirmDelete} 
                title="Delete Class" 
                message="Are you sure you want to delete this class? This may orphan student records if students are assigned to it." 
            />
        </div>
    );
}
