'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import TiptapEditor from '@/components/TiptapEditor';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import { getImageUrl } from "@/lib/utils";

export default function EventsManagement() {
    const [eventsList, setEventsList] = useState<any[]>([]);
    
    const [showModal, setShowModal] = useState(false);
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [form, setForm] = useState({ title: '', description: '', date: '', time: '', venue: '', image: null as File | null });
    const [deleteModalConfig, setDeleteModalConfig] = useState<{isOpen: boolean, id: number}>({ isOpen: false, id: 0 });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await axios.get('/api/website/events');
            setEventsList(res.data.events);
        } catch (err) {
            toast.error('Failed to load events');
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
        
        if (editingEvent) {
            formData.append('_method', 'PUT');
        }

        try {
            if (editingEvent) {
                await axios.post(`/api/website/events/${editingEvent.id}`, formData);
                toast.success('Event updated');
            } else {
                await axios.post('/api/website/events', formData);
                toast.success('Event added');
            }
            setShowModal(false);
            fetchEvents();
        } catch (err) {
            toast.error('Failed to save event');
        }
    };

    const handleDelete = (id: number) => {
        setDeleteModalConfig({ isOpen: true, id });
    };

    const confirmDelete = async () => {
        const { id } = deleteModalConfig;
        if (!id) return;
        
        try {
            await axios.delete(`/api/website/events/${id}`);
            toast.success('Event deleted');
            fetchEvents();
        } catch (err) {
            toast.error('Failed to delete event');
        } finally {
            setDeleteModalConfig({ isOpen: false, id: 0 });
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-on-surface">Events</h1>
                    <p className="text-on-surface-variant mt-1">Manage school events and calendar</p>
                </div>
                <button onClick={() => { setEditingEvent(null); setForm({ title: '', description: '', date: '', time: '', venue: '', image: null }); setShowModal(true); }} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium">Add Event</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventsList.map(event => (
                    <div key={event.id} className="bg-surface-container-low border border-outline/20 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                        <div className="h-40 bg-surface-container-highest relative">
                            {event.image ? (
                                <img src={getImageUrl(event.image)} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-4xl">📅</div>
                            )}
                            <div className="absolute top-2 left-2 bg-surface text-on-surface rounded-lg shadow-sm border border-outline/10 text-center overflow-hidden w-12">
                                <div className="bg-primary text-on-primary text-[10px] uppercase font-bold py-0.5">{event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : 'N/A'}</div>
                                <div className="font-bold text-lg">{event.date ? new Date(event.date).getDate() : '-'}</div>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="font-bold text-lg text-on-surface mb-2">{event.title}</h3>
                            <div className="space-y-1 mb-4 text-sm text-on-surface-variant">
                                {event.time && <div className="flex items-center gap-2"><span>⏰</span> {event.time}</div>}
                                {event.venue && <div className="flex items-center gap-2"><span>📍</span> {event.venue}</div>}
                            </div>
                            <div className="flex gap-2 mt-auto pt-4 border-t border-outline/10">
                                <button onClick={() => { 
                                    setEditingEvent(event); 
                                    setForm({
                                        title: event.title || '',
                                        description: event.description || '',
                                        date: event.date ? event.date.split('T')[0] : '',
                                        time: event.time ? event.time.substring(0, 5) : '',
                                        venue: event.venue || '',
                                        image: null
                                    }); 
                                    setShowModal(true); 
                                }} className="px-3 py-1.5 bg-surface-container text-on-surface rounded text-sm hover:bg-outline/20 font-medium">Edit</button>
                                <button onClick={() => handleDelete(event.id)} className="px-3 py-1.5 bg-red-500/10 text-red-600 rounded text-sm hover:bg-red-500/20 font-medium">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
                {eventsList.length === 0 && <div className="col-span-full text-center py-12 text-on-surface-variant bg-surface-container-low rounded-2xl border border-outline/10 border-dashed">No upcoming events scheduled.</div>}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-surface-container-low rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center sticky top-0 bg-surface-container-low z-10">
                            <h2 className="text-xl font-bold text-on-surface">{editingEvent ? 'Edit Event' : 'Add Event'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-on-surface text-2xl">&times;</button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Event Title *</label>
                                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Date</label>
                                    <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Time</label>
                                    <input type="time" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-on-surface mb-1">Venue</label>
                                    <input type="text" value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" placeholder="e.g. Main Hall" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Featured Image</label>
                                {editingEvent && editingEvent.image && (
                                    <div className="mb-2">
                                        <img src={getImageUrl(editingEvent.image)} className="h-20 object-cover rounded border border-outline/20" alt="Current Image" />
                                    </div>
                                )}
                                <input type="file" accept="image/*" onChange={e => { if(e.target.files) setForm({...form, image: e.target.files[0]}) }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface mb-1">Description</label>
                                <TiptapEditor value={form.description} onChange={val => setForm({...form, description: val})} />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-outline/20">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-surface-container-highest rounded-lg font-medium text-on-surface">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg font-medium">Save Event</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <DeleteConfirmationModal 
                isOpen={deleteModalConfig.isOpen} 
                onClose={() => setDeleteModalConfig({ isOpen: false, id: 0 })} 
                onConfirm={confirmDelete} 
                title="Delete Event" 
                message="Are you sure you want to delete this event?" 
            />
        </div>
    );
}
