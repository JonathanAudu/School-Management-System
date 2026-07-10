'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { getImageUrl } from "@/lib/utils";

export default function GalleryManagement() {
    const [albums, setAlbums] = useState<any[]>([]);
    
    // Album Modal
    const [showAlbumModal, setShowAlbumModal] = useState(false);
    const [editingAlbum, setEditingAlbum] = useState<any>(null);
    const [albumForm, setAlbumForm] = useState({ name: '', description: '', cover_image: null as File | null });

    // Photos View
    const [activeAlbum, setActiveAlbum] = useState<any>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    // Delete Modal State
    const [deleteModalConfig, setDeleteModalConfig] = useState<{isOpen: boolean, id: number, type: 'album' | 'photo', title: string, message: string}>({ 
        isOpen: false, id: 0, type: 'album', title: '', message: '' 
    });

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            const res = await axios.get('/api/website/albums');
            setAlbums(res.data.albums);
            // Update active album if one is selected
            if (activeAlbum) {
                const updated = res.data.albums.find((a: any) => a.id === activeAlbum.id);
                if (updated) setActiveAlbum(updated);
            }
        } catch (err) {
            toast.error('Failed to load albums');
        }
    };

    const handleSaveAlbum = async (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        Object.keys(albumForm).forEach(key => {
            if (key === 'cover_image' && albumForm.cover_image) {
                formData.append('cover_image', albumForm.cover_image);
            } else if (key !== 'cover_image') {
                formData.append(key, (albumForm as any)[key]);
            }
        });
        
        if (editingAlbum) {
            formData.append('_method', 'PUT');
        }

        try {
            if (editingAlbum) {
                await axios.post(`/api/website/albums/${editingAlbum.id}`, formData);
                toast.success('Album updated');
            } else {
                await axios.post('/api/website/albums', formData);
                toast.success('Album created');
            }
            setShowAlbumModal(false);
            fetchAlbums();
        } catch (err) {
            toast.error('Failed to save album');
        }
    };

    const handleDeleteAlbum = (id: number) => {
        setDeleteModalConfig({
            isOpen: true,
            id,
            type: 'album',
            title: 'Delete Album',
            message: 'Are you sure you want to delete this entire album and all its photos?'
        });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !activeAlbum) return;
        
        setIsUploadingPhoto(true);
        // Upload one by one for simplicity in this example
        try {
            for (let i = 0; i < e.target.files.length; i++) {
                const formData = new FormData();
                formData.append('photo_album_id', activeAlbum.id.toString());
                formData.append('image', e.target.files[i]);
                await axios.post('/api/website/photos', formData);
            }
            toast.success('Photos uploaded');
            fetchAlbums();
        } catch (err) {
            toast.error('Failed to upload some photos');
        } finally {
            setIsUploadingPhoto(false);
            e.target.value = '';
        }
    };

    const handleDeletePhoto = (id: number) => {
        setDeleteModalConfig({
            isOpen: true,
            id,
            type: 'photo',
            title: 'Delete Photo',
            message: 'Are you sure you want to delete this photo?'
        });
    };

    const confirmDelete = async () => {
        const { id, type } = deleteModalConfig;
        if (!id) return;

        try {
            if (type === 'album') {
                await axios.delete(`/api/website/albums/${id}`);
                toast.success('Album deleted');
                if (activeAlbum?.id === id) setActiveAlbum(null);
            } else if (type === 'photo') {
                await axios.delete(`/api/website/photos/${id}`);
                toast.success('Photo deleted');
            }
            fetchAlbums();
        } catch (err) {
            toast.error(`Failed to delete ${type}`);
        } finally {
            setDeleteModalConfig(prev => ({ ...prev, isOpen: false }));
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            {!activeAlbum ? (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold font-serif text-on-surface">Photo Gallery</h1>
                            <p className="text-on-surface-variant mt-1">Manage photo albums and images</p>
                        </div>
                        <button onClick={() => { setEditingAlbum(null); setAlbumForm({ name: '', description: '', cover_image: null }); setShowAlbumModal(true); }} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium">Create Album</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {albums.map(album => (
                            <div key={album.id} className="bg-surface-container-low border border-outline/20 rounded-2xl overflow-hidden shadow-sm flex flex-col group cursor-pointer" onClick={() => setActiveAlbum(album)}>
                                <div className="h-48 bg-surface-container-highest relative overflow-hidden">
                                    {album.cover_image ? (
                                        <img src={getImageUrl(album.cover_image)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : album.photos?.length > 0 ? (
                                        <img src={getImageUrl(album.photos[0].image)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-4xl">📁</div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <h3 className="font-bold text-lg leading-tight truncate">{album.name}</h3>
                                        <div className="text-xs text-white/80 mt-1">{album.photos?.length || 0} Photos</div>
                                    </div>
                                </div>
                                <div className="px-4 py-3 bg-surface-container flex justify-between items-center" onClick={e => e.stopPropagation()}>
                                    <button onClick={() => { 
                                        setEditingAlbum(album); 
                                        setAlbumForm({
                                            name: album.name || '',
                                            description: album.description || '',
                                            cover_image: null
                                        }); 
                                        setShowAlbumModal(true); 
                                    }} className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors">Edit Album</button>
                                    <button onClick={() => handleDeleteAlbum(album.id)} className="text-sm font-medium text-red-500 hover:text-red-600 transition-colors">Delete</button>
                                </div>
                            </div>
                        ))}
                        {albums.length === 0 && <div className="col-span-full text-center py-12 text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline/10 border-dashed">No photo albums created yet.</div>}
                    </div>
                </>
            ) : (
                <>
                    <div className="mb-6">
                        <button onClick={() => setActiveAlbum(null)} className="text-primary font-medium hover:underline flex items-center gap-2 mb-4">
                            <span>&larr;</span> Back to Albums
                        </button>
                        <div className="flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-bold font-serif text-on-surface">{activeAlbum.name}</h1>
                                <p className="text-on-surface-variant mt-1">{activeAlbum.description}</p>
                            </div>
                            <div className="relative">
                                <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploadingPhoto} />
                                <button disabled={isUploadingPhoto} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium pointer-events-none">
                                    {isUploadingPhoto ? 'Uploading...' : 'Upload Photos'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {activeAlbum.photos?.map((photo: any) => (
                            <div key={photo.id} className="aspect-square bg-surface-container-highest rounded-xl overflow-hidden relative group">
                                <img src={getImageUrl(photo.image)} alt="" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => handleDeletePhoto(photo.id)} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transform hover:scale-110 transition-all shadow-lg">🗑️</button>
                                </div>
                            </div>
                        ))}
                        {(!activeAlbum.photos || activeAlbum.photos.length === 0) && <div className="col-span-full text-center py-12 text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline/10 border-dashed">No photos in this album. Click "Upload Photos" to add some.</div>}
                    </div>
                </>
            )}

            {showAlbumModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-on-surface">{editingAlbum ? 'Edit Album' : 'Create Album'}</h2>
                            <button onClick={() => setShowAlbumModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSaveAlbum} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Album Name *</label>
                                <input type="text" value={albumForm.name} onChange={e => setAlbumForm({...albumForm, name: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Description</label>
                                <textarea rows={3} value={albumForm.description} onChange={e => setAlbumForm({...albumForm, description: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Cover Image (Optional)</label>
                                <p className="text-xs text-on-surface-variant mb-2">If left blank, the first photo in the album will be used.</p>
                                <input type="file" accept="image/*" onChange={e => { if(e.target.files) setAlbumForm({...albumForm, cover_image: e.target.files[0]}) }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-outline/20">
                                <button type="button" onClick={() => setShowAlbumModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium">Save Album</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal 
                isOpen={deleteModalConfig.isOpen} 
                onClose={() => setDeleteModalConfig(prev => ({ ...prev, isOpen: false }))} 
                onConfirm={confirmDelete} 
                title={deleteModalConfig.title} 
                message={deleteModalConfig.message} 
            />
        </div>
    );
}
