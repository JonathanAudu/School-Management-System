'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import Link from 'next/link';

export default function AcademicSessions() {
    const [sessions, setSessions] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingSession, setEditingSession] = useState<any>(null);
    const [form, setForm] = useState({ name: '', start_date: '', end_date: '', status: 'upcoming' });
    const [deleteModalConfig, setDeleteModalConfig] = useState<{isOpen: boolean, id: number}>({ isOpen: false, id: 0 });

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const res = await axios.get('/api/academic-sessions');
            setSessions(res.data.academic_sessions);
        } catch (err) {
            toast.error('Failed to load academic sessions');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            ...form,
            start_date: form.start_date || null,
            end_date: form.end_date || null,
        };

        try {
            if (editingSession) {
                await axios.put(`/api/academic-sessions/${editingSession.id}`, payload);
                toast.success('Session updated successfully');
            } else {
                await axios.post('/api/academic-sessions', payload);
                toast.success('Session created successfully');
            }
            setShowModal(false);
            fetchSessions();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save session');
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/api/academic-sessions/${deleteModalConfig.id}`);
            toast.success('Session deleted');
            fetchSessions();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete session');
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
                        <h1 className="text-3xl font-bold font-serif text-on-surface">Academic Sessions</h1>
                        <p className="text-on-surface-variant mt-1">Manage school years and set the active session.</p>
                    </div>
                    <button 
                        onClick={() => { setEditingSession(null); setForm({ name: '', start_date: '', end_date: '', status: 'upcoming' }); setShowModal(true); }} 
                        className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium"
                    >
                        Add Session
                    </button>
                </div>
            </div>

            <div className="bg-surface-container-low border border-outline/20 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-surface-container border-b border-outline/20 text-on-surface-variant text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Session Name</th>
                            <th className="p-4 font-semibold">Start Date</th>
                            <th className="p-4 font-semibold">End Date</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/10 text-on-surface">
                        {sessions.map(session => (
                            <tr key={session.id} className="hover:bg-surface-container-lowest transition-colors">
                                <td className="p-4 font-medium">{session.name}</td>
                                <td className="p-4">{session.start_date || '-'}</td>
                                <td className="p-4">{session.end_date || '-'}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                        session.status === 'active' ? 'bg-blue-100 text-blue-700 border border-blue-200' : 
                                        session.status === 'upcoming' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                        'bg-gray-100 text-gray-700 border border-gray-200'
                                    }`}>
                                        {session.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button 
                                        onClick={() => { 
                                            setEditingSession(session); 
                                            setForm({ 
                                                name: session.name, 
                                                start_date: session.start_date || '', 
                                                end_date: session.end_date || '', 
                                                status: session.status 
                                            }); 
                                            setShowModal(true); 
                                        }} 
                                        className="text-primary hover:bg-primary/10 px-3 py-1 rounded transition-colors text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => setDeleteModalConfig({ isOpen: true, id: session.id })} 
                                        className="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm font-medium"
                                        disabled={session.status === 'active'}
                                        title={session.status === 'active' ? "Cannot delete active session" : ""}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {sessions.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-on-surface-variant italic">No academic sessions found. Create one to get started.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-lg shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-on-surface">{editingSession ? 'Edit Session' : 'Add Session'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Session Name *</label>
                                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" placeholder="e.g. 2025/2026" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Start Date</label>
                                    <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">End Date</label>
                                    <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Status</label>
                                <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface">
                                    <option value="upcoming">Upcoming</option>
                                    <option value="active">Active (Set as Current)</option>
                                    <option value="completed">Completed</option>
                                </select>
                                <p className="text-xs text-on-surface-variant mt-1">Note: Only one session can be active at a time.</p>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium">Save Session</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal 
                isOpen={deleteModalConfig.isOpen} 
                onClose={() => setDeleteModalConfig({ isOpen: false, id: 0 })} 
                onConfirm={confirmDelete} 
                title="Delete Academic Session" 
                message="Are you sure you want to delete this session? This action cannot be undone." 
            />
        </div>
    );
}
