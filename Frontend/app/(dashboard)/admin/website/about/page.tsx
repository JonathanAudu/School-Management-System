'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import TiptapEditor from '@/components/TiptapEditor';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';

export default function AboutUsManagement() {
    const [activeTab, setActiveTab] = useState('history');
    const [settings, setSettings] = useState<any>({});
    const [leaders, setLeaders] = useState<any[]>([]);

    const [isSaving, setIsSaving] = useState(false);
    const [deleteModalConfig, setDeleteModalConfig] = useState<{isOpen: boolean, id: number}>({ isOpen: false, id: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [settingsRes, leadersRes] = await Promise.all([
                axios.get('/api/website/settings?group=about'),
                axios.get('/api/website/leadership-members')
            ]);
            
            const fetchedSettings: any = {};
            Object.values(settingsRes.data.settings).forEach((s: any) => {
                fetchedSettings[s.key] = s.value;
            });
            setSettings(fetchedSettings);
            
            setLeaders(leadersRes.data.members);
        } catch (err) {
            toast.error('Failed to load about us data');
        }
    };

    const handleSaveSettings = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            Object.keys(settings).forEach(key => {
                if (settings[key] instanceof File) {
                    formData.append(key, settings[key]);
                } else if (settings[key] !== null && settings[key] !== undefined) {
                    formData.append(key, settings[key]);
                }
                formData.append(`${key}_group`, 'about');
            });

            await axios.post('/api/website/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Settings saved successfully');
            fetchData();
        } catch (err) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    // Leadership Management
    const [showLeaderModal, setShowLeaderModal] = useState(false);
    const [editingLeader, setEditingLeader] = useState<any>(null);
    const [leaderForm, setLeaderForm] = useState({ name: '', position: '', bio: '', order: 0, photo: null as File | null });

    const handleSaveLeader = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(leaderForm).forEach(key => {
            if (key === 'photo' && leaderForm.photo) {
                formData.append('photo', leaderForm.photo);
            } else if (key !== 'photo') {
                formData.append(key, (leaderForm as any)[key]);
            }
        });
        
        if (editingLeader) {
            formData.append('_method', 'PUT');
        }

        try {
            if (editingLeader) {
                await axios.post(`/api/website/leadership-members/${editingLeader.id}`, formData);
                toast.success('Leader updated');
            } else {
                await axios.post('/api/website/leadership-members', formData);
                toast.success('Leader added');
            }
            setShowLeaderModal(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to save leader');
        }
    };

    const deleteLeader = (id: number) => {
        setDeleteModalConfig({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        const { id } = deleteModalConfig;
        if (!id) return;
        
        try {
            await axios.delete(`/api/website/leadership-members/${id}`);
            toast.success('Leader deleted');
            fetchData();
        } catch (err) {
            toast.error('Failed to delete leader');
        } finally {
            setDeleteModalConfig({ isOpen: false, id: 0 });
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-serif text-on-surface">About Us Management</h1>
                <p className="text-on-surface-variant mt-1">Manage school history, vision, and leadership</p>
            </div>

            <div className="flex border-b border-outline/20 mb-6 gap-6">
                <button onClick={() => setActiveTab('history')} className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>School History</button>
                <button onClick={() => setActiveTab('vision')} className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'vision' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Vision & Mission</button>
                <button onClick={() => setActiveTab('leadership')} className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'leadership' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Leadership</button>
            </div>

            {/* History Tab */}
            {activeTab === 'history' && (
                <form onSubmit={handleSaveSettings} className="bg-surface-container-low p-6 rounded-2xl border border-outline/20 space-y-6">
                    <h2 className="text-xl font-bold text-on-surface mb-4">Our History</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">History Content</label>
                        <TiptapEditor value={settings.school_history || ''} onChange={val => setSettings({...settings, school_history: val})} />
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            )}

            {/* Vision & Mission Tab */}
            {activeTab === 'vision' && (
                <form onSubmit={handleSaveSettings} className="bg-surface-container-low p-6 rounded-2xl border border-outline/20 space-y-6">
                    <h2 className="text-xl font-bold text-on-surface mb-4">Vision & Mission</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Vision Statement</label>
                        <textarea rows={3} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.vision_statement || ''} onChange={e => setSettings({...settings, vision_statement: e.target.value})}></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Mission Statement</label>
                        <textarea rows={3} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.mission_statement || ''} onChange={e => setSettings({...settings, mission_statement: e.target.value})}></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Core Values (Rich Text)</label>
                        <TiptapEditor value={settings.core_values || ''} onChange={val => setSettings({...settings, core_values: val})} />
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            )}

            {/* Leadership Tab */}
            {activeTab === 'leadership' && (
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline/20">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-on-surface">School Leadership</h2>
                        <button onClick={() => { setEditingLeader(null); setLeaderForm({ name: '', position: '', bio: '', order: 0, photo: null }); setShowLeaderModal(true); }} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium">Add Leader</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {leaders.map(leader => (
                            <div key={leader.id} className="bg-surface-container p-6 rounded-xl border border-outline/10 text-center relative group flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full bg-surface-container-highest overflow-hidden mb-4 border-4 border-surface">
                                    {leader.photo ? (
                                        <img src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${leader.photo}`} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-on-surface-variant text-2xl font-bold">
                                            {leader.name[0]}
                                        </div>
                                    )}
                                </div>
                                <div className="text-lg font-bold text-on-surface">{leader.name}</div>
                                <div className="text-sm text-primary font-medium mb-3">{leader.position}</div>
                                <p className="text-xs text-on-surface-variant line-clamp-3 mb-4 flex-1">{leader.bio}</p>
                                
                                <div className="flex gap-2 mt-auto">
                                    <button onClick={() => { 
                                        setEditingLeader(leader); 
                                        setLeaderForm({
                                            name: leader.name || '',
                                            position: leader.position || '',
                                            bio: leader.bio || '',
                                            order: leader.order || 0,
                                            photo: null
                                        }); 
                                        setShowLeaderModal(true); 
                                    }} className="px-3 py-1.5 bg-surface-container-highest text-on-surface rounded text-sm hover:bg-outline/20">Edit</button>
                                    <button onClick={() => deleteLeader(leader.id)} className="px-3 py-1.5 bg-red-500/10 text-red-600 rounded text-sm hover:bg-red-500/20">Delete</button>
                                </div>
                            </div>
                        ))}
                        {leaders.length === 0 && <div className="col-span-full text-center py-8 text-on-surface-variant">No leadership members added yet.</div>}
                    </div>
                </div>
            )}

            {/* Leader Modal */}
            {showLeaderModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-on-surface">{editingLeader ? 'Edit Leader' : 'Add New Leader'}</h2>
                            <button onClick={() => setShowLeaderModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSaveLeader} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Photo</label>
                                <input type="file" accept="image/*" onChange={e => { if(e.target.files) setLeaderForm({...leaderForm, photo: e.target.files[0]}) }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" required={!editingLeader} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Full Name *</label>
                                    <input type="text" value={leaderForm.name} onChange={e => setLeaderForm({...leaderForm, name: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Position *</label>
                                    <input type="text" value={leaderForm.position} onChange={e => setLeaderForm({...leaderForm, position: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Short Bio</label>
                                <textarea rows={4} value={leaderForm.bio} onChange={e => setLeaderForm({...leaderForm, bio: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Order (Sort)</label>
                                <input type="number" value={leaderForm.order} onChange={e => setLeaderForm({...leaderForm, order: parseInt(e.target.value) || 0})} className="w-full md:w-1/3 px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-outline/20">
                                <button type="button" onClick={() => setShowLeaderModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium">Save Leader</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal 
                isOpen={deleteModalConfig.isOpen} 
                onClose={() => setDeleteModalConfig({ isOpen: false, id: 0 })} 
                onConfirm={confirmDelete} 
                title="Delete Leader" 
                message="Are you sure you want to delete this leadership member?" 
            />
        </div>
    );
}
