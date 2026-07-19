'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import Link from 'next/link';

export default function TermsManagement() {
    const [terms, setTerms] = useState<any[]>([]);
    const [sessions, setSessions] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingTerm, setEditingTerm] = useState<any>(null);
    const [form, setForm] = useState({ name: '', academic_session_id: '', start_date: '', end_date: '', is_current: false });
    const [deleteModalConfig, setDeleteModalConfig] = useState<{isOpen: boolean, id: number}>({ isOpen: false, id: 0 });

    useEffect(() => {
        fetchTerms();
        fetchSessions();
    }, []);

    const fetchTerms = async () => {
        try {
            const res = await axios.get('/api/terms');
            setTerms(res.data.terms);
        } catch (err) {
            toast.error('Failed to load terms');
        }
    };

    const fetchSessions = async () => {
        try {
            const res = await axios.get('/api/academic-sessions');
            setSessions(res.data.academic_sessions);
            
            // Auto-select active session if available for new terms
            const activeSession = res.data.academic_sessions.find((s: any) => s.status === 'active');
            if (activeSession) {
                setForm(prev => ({ ...prev, academic_session_id: activeSession.id.toString() }));
            }
        } catch (err) {
            // Silently fail or log, as it might not be critical if sessions are empty
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.academic_session_id) {
            toast.error('Please select an Academic Session');
            return;
        }

        const payload = {
            ...form,
            start_date: form.start_date || null,
            end_date: form.end_date || null,
        };

        try {
            if (editingTerm) {
                await axios.put(`/api/terms/${editingTerm.id}`, payload);
                toast.success('Term updated successfully');
            } else {
                await axios.post('/api/terms', payload);
                toast.success('Term created successfully');
            }
            setShowModal(false);
            fetchTerms();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save term');
        }
    };

    const confirmDelete = async () => {
        try {
            await axios.delete(`/api/terms/${deleteModalConfig.id}`);
            toast.success('Term deleted');
            fetchTerms();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to delete term');
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
                        <h1 className="text-3xl font-bold font-serif text-on-surface">Terms</h1>
                        <p className="text-on-surface-variant mt-1">Manage school terms and link them to academic sessions.</p>
                    </div>
                    <button 
                        onClick={() => { 
                            setEditingTerm(null); 
                            const activeSession = sessions.find((s: any) => s.status === 'active');
                            setForm({ 
                                name: '', 
                                academic_session_id: activeSession ? activeSession.id.toString() : (sessions.length > 0 ? sessions[0].id.toString() : ''), 
                                start_date: '', 
                                end_date: '', 
                                is_current: false 
                            }); 
                            setShowModal(true); 
                        }} 
                        className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium"
                    >
                        Add Term
                    </button>
                </div>
            </div>

            <div className="bg-surface-container-low border border-outline/20 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-surface-container border-b border-outline/20 text-on-surface-variant text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Term Name</th>
                            <th className="p-4 font-semibold">Academic Session</th>
                            <th className="p-4 font-semibold">Start Date</th>
                            <th className="p-4 font-semibold">End Date</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/10 text-on-surface">
                        {terms.map(term => (
                            <tr key={term.id} className="hover:bg-surface-container-lowest transition-colors">
                                <td className="p-4 font-medium">{term.name}</td>
                                <td className="p-4">{term.academic_session ? term.academic_session.name : <span className="text-red-500 text-sm">Unassigned</span>}</td>
                                <td className="p-4">{term.start_date || '-'}</td>
                                <td className="p-4">{term.end_date || '-'}</td>
                                <td className="p-4">
                                    {term.is_current ? (
                                        <span className="px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-blue-100 text-blue-700 border border-blue-200">
                                            Current Term
                                        </span>
                                    ) : (
                                        <span className="text-on-surface-variant text-sm">Inactive</span>
                                    )}
                                </td>
                                <td className="p-4 text-right flex justify-end gap-2">
                                    <button 
                                        onClick={() => { 
                                            setEditingTerm(term); 
                                            setForm({ 
                                                name: term.name, 
                                                academic_session_id: term.academic_session_id?.toString() || '', 
                                                start_date: term.start_date || '', 
                                                end_date: term.end_date || '', 
                                                is_current: term.is_current 
                                            }); 
                                            setShowModal(true); 
                                        }} 
                                        className="text-primary hover:bg-primary/10 px-3 py-1 rounded transition-colors text-sm font-medium"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => setDeleteModalConfig({ isOpen: true, id: term.id })} 
                                        className="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition-colors text-sm font-medium"
                                        disabled={term.is_current}
                                        title={term.is_current ? "Cannot delete the current term" : ""}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {terms.length === 0 && (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-on-surface-variant italic">No terms found. Create one to get started.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-lg shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-on-surface">{editingTerm ? 'Edit Term' : 'Add Term'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Term Name *</label>
                                <select 
                                    value={form.name} 
                                    onChange={e => setForm({...form, name: e.target.value})} 
                                    required 
                                    className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface"
                                >
                                    <option value="" disabled>Select a term</option>
                                    <option value="First Term">First Term</option>
                                    <option value="Second Term">Second Term</option>
                                    <option value="Third Term">Third Term</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Academic Session *</label>
                                <select 
                                    value={form.academic_session_id} 
                                    onChange={e => setForm({...form, academic_session_id: e.target.value})} 
                                    required 
                                    className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface"
                                >
                                    <option value="" disabled>Select a session</option>
                                    {sessions.map(session => (
                                        <option key={session.id} value={session.id}>
                                            {session.name} {session.status === 'active' ? '(Active)' : ''}
                                        </option>
                                    ))}
                                </select>
                                {sessions.length === 0 && (
                                    <p className="text-red-500 text-xs mt-1">Please create an Academic Session first.</p>
                                )}
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
                            <div className="flex items-center gap-2 mt-4">
                                <input 
                                    type="checkbox" 
                                    id="is_current" 
                                    checked={form.is_current} 
                                    onChange={e => setForm({...form, is_current: e.target.checked})} 
                                    className="w-4 h-4 text-primary bg-surface border-outline/20 rounded focus:ring-primary focus:ring-2"
                                />
                                <label htmlFor="is_current" className="text-sm font-medium text-on-surface">Set as Current Term</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium" disabled={sessions.length === 0}>Save Term</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal 
                isOpen={deleteModalConfig.isOpen} 
                onClose={() => setDeleteModalConfig({ isOpen: false, id: 0 })} 
                onConfirm={confirmDelete} 
                title="Delete Term" 
                message="Are you sure you want to delete this term? This action cannot be undone." 
            />
        </div>
    );
}
