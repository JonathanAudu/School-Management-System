'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import TiptapEditor from '@/components/TiptapEditor';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { getImageUrl } from "@/lib/utils";

export default function HomepageManagement() {
    const [activeTab, setActiveTab] = useState('hero');
    const [settings, setSettings] = useState<any>({});
    const [slides, setSlides] = useState<any[]>([]);
    const [stats, setStats] = useState<any[]>([]);

    // Form states
    const [isSaving, setIsSaving] = useState(false);
    const [deleteModalConfig, setDeleteModalConfig] = useState<{isOpen: boolean, id: number, type: string, title?: string, message?: string}>({ isOpen: false, id: 0, type: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [settingsRes, slidesRes, statsRes] = await Promise.all([
                axios.get('/api/website/settings?group=homepage'),
                axios.get('/api/website/hero-slides'),
                axios.get('/api/website/quick-stats')
            ]);
            
            const fetchedSettings: any = {};
            Object.values(settingsRes.data.settings).forEach((s: any) => {
                fetchedSettings[s.key] = s.value;
            });
            setSettings(fetchedSettings);
            
            setSlides(slidesRes.data.slides);
            setStats(statsRes.data.stats);
        } catch (err) {
            toast.error('Failed to load homepage data');
        }
    };

    const handleSaveSettings = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            Object.keys(settings).forEach(key => {
                // Ignore file objects if they haven't changed (simplistic approach for now)
                if (settings[key] instanceof File) {
                    formData.append(key, settings[key]);
                } else if (settings[key] !== null && settings[key] !== undefined) {
                    formData.append(key, settings[key]);
                }
                formData.append(`${key}_group`, 'homepage');
            });

            await axios.post('/api/website/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Settings saved successfully');
            fetchData();
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    // Hero Slides Management
    const [showSlideModal, setShowSlideModal] = useState(false);
    const [editingSlide, setEditingSlide] = useState<any>(null);
    const [slideForm, setSlideForm] = useState({ title: '', subtitle: '', button_text: '', button_link: '', is_active: true, order: 0, image: null as File | null });

    const handleSaveSlide = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(slideForm).forEach(key => {
            if (key === 'image' && slideForm.image) {
                formData.append('image', slideForm.image);
            } else if (key === 'is_active') {
                formData.append('is_active', slideForm.is_active ? '1' : '0');
            } else if (key !== 'image') {
                formData.append(key, (slideForm as any)[key]);
            }
        });
        // Need to add method spoofing for PUT since we're sending FormData
        if (editingSlide) {
            formData.append('_method', 'PUT');
        }

        try {
            if (editingSlide) {
                await axios.post(`/api/website/hero-slides/${editingSlide.id}`, formData);
                toast.success('Slide updated');
            } else {
                await axios.post('/api/website/hero-slides', formData);
                toast.success('Slide added');
            }
            setShowSlideModal(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to save slide');
        }
    };

    const deleteSlide = (id: number) => {
        setDeleteModalConfig({ 
            isOpen: true, 
            id, 
            type: 'slide', 
            title: 'Delete Slide', 
            message: 'Are you sure you want to delete this slide?' 
        });
    };

    // Stats Management
    const [showStatModal, setShowStatModal] = useState(false);
    const [editingStat, setEditingStat] = useState<any>(null);
    const [statForm, setStatForm] = useState({ icon: '', number: '', title: '', suffix: '', order: 0 });

    const handleSaveStat = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStat) {
                await axios.put(`/api/website/quick-stats/${editingStat.id}`, statForm);
                toast.success('Stat updated');
            } else {
                await axios.post('/api/website/quick-stats', statForm);
                toast.success('Stat added');
            }
            setShowStatModal(false);
            fetchData();
        } catch (err) {
            toast.error('Failed to save stat');
        }
    };

    const deleteStat = (id: number) => {
        setDeleteModalConfig({ 
            isOpen: true, 
            id, 
            type: 'stat', 
            title: 'Delete Stat', 
            message: 'Are you sure you want to delete this stat?' 
        });
    };

    const confirmDelete = async () => {
        const { id, type } = deleteModalConfig;
        if (!id) return;
        
        try {
            if (type === 'slide') {
                await axios.delete(`/api/website/hero-slides/${id}`);
                toast.success('Slide deleted');
            } else if (type === 'stat') {
                await axios.delete(`/api/website/quick-stats/${id}`);
                toast.success('Stat deleted');
            }
            fetchData();
        } catch (err) {
            toast.error(`Failed to delete ${type}`);
        } finally {
            setDeleteModalConfig({ ...deleteModalConfig, isOpen: false });
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8 flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-on-surface">Homepage Management</h1>
                    <p className="text-on-surface-variant mt-1">Manage content displayed on the public landing page</p>
                </div>
                <a href="/" target="_blank" className="px-4 py-2 bg-surface-container-highest text-on-surface rounded-lg text-sm font-medium hover:bg-outline/20 flex items-center gap-2">
                    View Live Website ↗
                </a>
            </div>

            <div className="flex border-b border-outline/20 mb-6 gap-6">
                <button onClick={() => setActiveTab('hero')} className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'hero' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Hero Slider</button>
                <button onClick={() => setActiveTab('welcome')} className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'welcome' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Welcome Message</button>
                <button onClick={() => setActiveTab('stats')} className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'stats' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Quick Stats</button>
                <button onClick={() => setActiveTab('toggles')} className={`pb-3 font-medium transition-colors border-b-2 ${activeTab === 'toggles' ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Section Toggles</button>
            </div>

            {/* Hero Tab */}
            {activeTab === 'hero' && (
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline/20">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-on-surface">Hero Slides</h2>
                        <button onClick={() => { setEditingSlide(null); setSlideForm({ title: '', subtitle: '', button_text: '', button_link: '', is_active: true, order: 0, image: null }); setShowSlideModal(true); }} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium">Add New Slide</button>
                    </div>
                    
                    <div className="space-y-4">
                        {slides.map(slide => (
                            <div key={slide.id} className="flex gap-4 items-center bg-surface-container p-4 rounded-xl border border-outline/10">
                                <div className="w-32 h-20 bg-surface-container-highest rounded overflow-hidden flex-shrink-0 relative">
                                    {slide.image && <img src={getImageUrl(slide.image)} alt="" className="w-full h-full object-cover" />}
                                    {!slide.is_active && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-xs text-white font-bold">INACTIVE</div>}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-on-surface">{slide.title || '(No Title)'}</h3>
                                    <p className="text-sm text-on-surface-variant">{slide.subtitle}</p>
                                    <div className="text-xs text-on-surface-variant mt-1">Order: {slide.order}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => { 
                                        setEditingSlide(slide); 
                                        setSlideForm({
                                            title: slide.title || '',
                                            subtitle: slide.subtitle || '',
                                            button_text: slide.button_text || '',
                                            button_link: slide.button_link || '',
                                            is_active: slide.is_active === undefined ? true : !!slide.is_active,
                                            order: slide.order || 0,
                                            image: null
                                        }); 
                                        setShowSlideModal(true); 
                                    }} className="px-3 py-1.5 bg-surface-container-highest text-on-surface rounded text-sm hover:bg-outline/20">Edit</button>
                                    <button onClick={() => deleteSlide(slide.id)} className="px-3 py-1.5 bg-red-500/10 text-red-600 rounded text-sm hover:bg-red-500/20">Delete</button>
                                </div>
                            </div>
                        ))}
                        {slides.length === 0 && <div className="text-center py-8 text-on-surface-variant">No slides added yet.</div>}
                    </div>
                </div>
            )}

            {/* Welcome Message Tab */}
            {activeTab === 'welcome' && (
                <form onSubmit={handleSaveSettings} className="bg-surface-container-low p-6 rounded-2xl border border-outline/20 space-y-6">
                    <h2 className="text-xl font-bold text-on-surface mb-4">Welcome Section</h2>
                    
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Heading</label>
                        <input type="text" className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.welcome_heading || ''} onChange={e => setSettings({...settings, welcome_heading: e.target.value})} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Body Text</label>
                        <TiptapEditor value={settings.welcome_body || ''} onChange={val => setSettings({...settings, welcome_body: val})} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Side Image (Optional)</label>
                        <input type="file" accept="image/*" onChange={e => { if(e.target.files) setSettings({...settings, welcome_image: e.target.files[0]}) }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                        {typeof settings.welcome_image === 'string' && settings.welcome_image && (
                            <div className="mt-4">
                                <p className="text-sm font-medium text-on-surface-variant mb-2">Current Image:</p>
                                <img src={getImageUrl(settings.welcome_image)} alt="Current uploaded image" className="w-48 h-auto object-cover rounded-lg shadow-sm border border-outline/20" />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
                <div className="bg-surface-container-low p-6 rounded-2xl border border-outline/20">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-on-surface">Quick Stats</h2>
                        <button onClick={() => { setEditingStat(null); setStatForm({ icon: '', number: '', title: '', suffix: '', order: 0 }); setShowStatModal(true); }} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium">Add New Stat</button>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {stats.map(stat => (
                            <div key={stat.id} className="bg-surface-container p-6 rounded-xl border border-outline/10 text-center relative group">
                                <div className="text-4xl mb-2">{stat.icon}</div>
                                <div className="text-2xl font-bold text-on-surface">{stat.number}{stat.suffix}</div>
                                <div className="text-sm text-on-surface-variant">{stat.title}</div>
                                
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button onClick={() => { 
                                        setEditingStat(stat); 
                                        setStatForm({
                                            icon: stat.icon || '',
                                            number: stat.number || '',
                                            title: stat.title || '',
                                            suffix: stat.suffix || '',
                                            order: stat.order || 0
                                        }); 
                                        setShowStatModal(true); 
                                    }} className="p-1 bg-surface-container-highest rounded text-xs">✏️</button>
                                    <button onClick={() => deleteStat(stat.id)} className="p-1 bg-red-500/10 text-red-600 rounded text-xs">🗑️</button>
                                </div>
                            </div>
                        ))}
                        {stats.length === 0 && <div className="col-span-full text-center py-8 text-on-surface-variant">No stats added yet.</div>}
                    </div>
                </div>
            )}

            {/* Toggles Tab */}
            {activeTab === 'toggles' && (
                <form onSubmit={handleSaveSettings} className="bg-surface-container-low p-6 rounded-2xl border border-outline/20 space-y-6">
                    <h2 className="text-xl font-bold text-on-surface mb-4">Section Visibility</h2>
                    
                    <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
                        <div>
                            <div className="font-bold text-on-surface">Show News Section</div>
                            <div className="text-sm text-on-surface-variant">Display latest news on the homepage</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={settings.show_news === 'true' || settings.show_news === true} onChange={e => setSettings({...settings, show_news: e.target.checked})} />
                            <div className="w-11 h-6 bg-outline/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
                        <div>
                            <div className="font-bold text-on-surface">Show Events Section</div>
                            <div className="text-sm text-on-surface-variant">Display upcoming events on the homepage</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={settings.show_events === 'true' || settings.show_events === true} onChange={e => setSettings({...settings, show_events: e.target.checked})} />
                            <div className="w-11 h-6 bg-outline/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Number of News/Events items to display</label>
                        <select className="w-full md:w-1/3 px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.items_to_display || '3'} onChange={e => setSettings({...settings, items_to_display: e.target.value})}>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="6">6</option>
                            <option value="8">8</option>
                        </select>
                    </div>

                    <div className="flex justify-end">
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            )}

            {/* Slide Modal */}
            {showSlideModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-2xl overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-on-surface">{editingSlide ? 'Edit Slide' : 'Add New Slide'}</h2>
                            <button onClick={() => setShowSlideModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSaveSlide} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Slide Image *</label>
                                {editingSlide && editingSlide.image && (
                                    <div className="mb-2">
                                        <img src={getImageUrl(editingSlide.image)} className="h-20 object-cover rounded border border-outline/20" alt="Current Image" />
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={e => { if(e.target.files) setSlideForm({...slideForm, image: e.target.files[0]}) }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" required={!editingSlide} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Title</label>
                                <input type="text" value={slideForm.title} onChange={e => setSlideForm({...slideForm, title: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Subtitle</label>
                                <input type="text" value={slideForm.subtitle} onChange={e => setSlideForm({...slideForm, subtitle: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Button Text</label>
                                    <input type="text" value={slideForm.button_text} onChange={e => setSlideForm({...slideForm, button_text: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Button Link</label>
                                    <input type="text" value={slideForm.button_link} onChange={e => setSlideForm({...slideForm, button_link: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Order (Sort)</label>
                                    <input type="number" value={slideForm.order} onChange={e => setSlideForm({...slideForm, order: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                                </div>
                                <div className="flex items-center mt-6">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={slideForm.is_active} onChange={e => setSlideForm({...slideForm, is_active: e.target.checked})} className="w-4 h-4 text-primary" />
                                        <span className="text-sm font-medium text-on-surface">Active</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-outline/20">
                                <button type="button" onClick={() => setShowSlideModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium">Save Slide</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Stat Modal */}
            {showStatModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-on-surface">{editingStat ? 'Edit Stat' : 'Add New Stat'}</h2>
                            <button onClick={() => setShowStatModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSaveStat} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Icon (Emoji/Text)</label>
                                <select 
                                    value={statForm.icon} 
                                    onChange={e => setStatForm({...statForm, icon: e.target.value})} 
                                    className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface"
                                >
                                    <option value="">Select an icon...</option>
                                    <option value="👨‍🎓">👨‍🎓 Students/Graduates</option>
                                    <option value="📚">📚 Library/Books</option>
                                    <option value="🏆">🏆 Awards/Excellence</option>
                                    <option value="🏫">🏫 Campus/School</option>
                                    <option value="👥">👥 Staff/Community</option>
                                    <option value="⚽️">⚽️ Sports/Athletics</option>
                                    <option value="🔬">🔬 Science/Labs</option>
                                    <option value="💻">💻 Technology/Computing</option>
                                    <option value="🎨">🎨 Arts/Creativity</option>
                                    <option value="🎵">🎵 Music/Band</option>
                                    <option value="🌍">🌍 Global/Diversity</option>
                                    <option value="🚀">🚀 Innovation/Future</option>
                                    <option value="⭐">⭐ Rating/Quality</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Number *</label>
                                <input type="text" value={statForm.number} onChange={e => setStatForm({...statForm, number: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" placeholder="e.g. 1500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Suffix</label>
                                <input type="text" value={statForm.suffix} onChange={e => setStatForm({...statForm, suffix: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" placeholder="e.g. +" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Title *</label>
                                <input type="text" value={statForm.title} onChange={e => setStatForm({...statForm, title: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" placeholder="e.g. Students" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Order</label>
                                <input type="number" value={statForm.order} onChange={e => setStatForm({...statForm, order: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-outline/20">
                                <button type="button" onClick={() => setShowStatModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium">Save Stat</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal 
                isOpen={deleteModalConfig.isOpen} 
                onClose={() => setDeleteModalConfig({ ...deleteModalConfig, isOpen: false })} 
                onConfirm={confirmDelete} 
                title={deleteModalConfig.title} 
                message={deleteModalConfig.message} 
            />
        </div>
    );
}
