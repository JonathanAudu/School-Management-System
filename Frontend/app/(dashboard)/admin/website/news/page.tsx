'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import TiptapEditor from '@/components/TiptapEditor';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { getImageUrl } from "@/lib/utils";

export default function NewsManagement() {
    const [newsList, setNewsList] = useState<any[]>([]);
    
    const [showModal, setShowModal] = useState(false);
    const [editingNews, setEditingNews] = useState<any>(null);
    const [form, setForm] = useState({ title: '', content: '', category: '', published_at: '', image: null as File | null });
    const [deleteModalConfig, setDeleteModalConfig] = useState<{isOpen: boolean, id: number}>({ isOpen: false, id: 0 });

    useEffect(() => {
        fetchNews();
    }, []);

    const fetchNews = async () => {
        try {
            const res = await axios.get('/api/website/news');
            setNewsList(res.data.news);
        } catch (err) {
            toast.error('Failed to load news');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(form).forEach(key => {
            if (key === 'image' && form.image) {
                formData.append('image', form.image);
            } else if (key !== 'image') {
                formData.append(key, (form as any)[key]);
            }
        });
        
        if (editingNews) {
            formData.append('_method', 'PUT');
        }

        try {
            if (editingNews) {
                await axios.post(`/api/website/news/${editingNews.id}`, formData);
                toast.success('News updated');
            } else {
                await axios.post('/api/website/news', formData);
                toast.success('News added');
            }
            setShowModal(false);
            fetchNews();
        } catch (err) {
            toast.error('Failed to save news');
        }
    };

    const handleDelete = (id: number) => {
        setDeleteModalConfig({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        const { id } = deleteModalConfig;
        if (!id) return;
        
        try {
            await axios.delete(`/api/website/news/${id}`);
            toast.success('News deleted');
            fetchNews();
        } catch (err) {
            toast.error('Failed to delete news');
        } finally {
            setDeleteModalConfig({ isOpen: false, id: 0 });
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-on-surface">News & Announcements</h1>
                    <p className="text-on-surface-variant mt-1">Manage public news articles</p>
                </div>
                <button onClick={() => { setEditingNews(null); setForm({ title: '', content: '', category: '', published_at: new Date().toISOString().split('T')[0], image: null }); setShowModal(true); }} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium">Add News</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsList.map(news => (
                    <div key={news.id} className="bg-surface-container-low border border-outline/20 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                        <div className="h-48 bg-surface-container-highest relative">
                            {news.image ? (
                                <img src={getImageUrl(news.image)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">📰</div>
                            )}
                            {news.category && (
                                <span className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-xs font-bold rounded">{news.category}</span>
                            )}
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-on-surface mb-2 line-clamp-2">{news.title}</h3>
                            <div className="text-xs text-on-surface-variant mb-4 font-medium">Published: {news.published_at || 'N/A'}</div>
                            <div className="flex gap-2 mt-auto pt-4 border-t border-outline/10">
                                <button onClick={() => { 
                                    setEditingNews(news); 
                                    setForm({
                                        title: news.title || '',
                                        content: news.content || '',
                                        category: news.category || '',
                                        published_at: news.published_at ? news.published_at.split('T')[0] : '',
                                        image: null
                                    }); 
                                    setShowModal(true); 
                                }} className="px-3 py-1.5 bg-surface-container text-on-surface rounded text-sm hover:bg-outline/20 font-medium">Edit</button>
                                <button onClick={() => handleDelete(news.id)} className="px-3 py-1.5 bg-red-500/10 text-red-600 rounded text-sm hover:bg-red-500/20 font-medium">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {newsList.length === 0 && <div className="col-span-full text-center py-12 text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline/10 border-dashed">No news articles published yet.</div>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center sticky top-0 bg-surface-container-low z-10">
                            <h2 className="text-xl font-bold text-on-surface">{editingNews ? 'Edit News' : 'Add News'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Category</label>
                                    <input type="text" value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" placeholder="e.g. Announcement, General" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Publish Date</label>
                                    <input type="date" value={form.published_at} onChange={e => setForm({...form, published_at: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Featured Image</label>
                                {editingNews && editingNews.image && (
                                    <div className="mb-2">
                                        <img src={getImageUrl(editingNews.image)} className="h-20 object-cover rounded border border-outline/20" alt="Current Image" />
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={e => { if(e.target.files) setForm({...form, image: e.target.files[0]}) }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Content</label>
                                <TiptapEditor value={form.content} onChange={val => setForm({...form, content: val})} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-outline/20">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium">Save News</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal 
                isOpen={deleteModalConfig.isOpen} 
                onClose={() => setDeleteModalConfig({ isOpen: false, id: 0 })} 
                onConfirm={confirmDelete} 
                title="Delete News" 
                message="Are you sure you want to delete this news article?" 
            />
        </div>
    );
}
