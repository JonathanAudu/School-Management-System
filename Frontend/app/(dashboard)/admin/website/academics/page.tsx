'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import TiptapEditor from '@/components/TiptapEditor';

export default function AcademicsManagement() {
    const [settings, setSettings] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/website/settings?group=academics');
            const fetchedSettings: any = {};
            Object.values(res.data.settings).forEach((s: any) => {
                fetchedSettings[s.key] = s.value;
            });
            setSettings(fetchedSettings);
        } catch (err) {
            toast.error('Failed to load academics data');
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            Object.keys(settings).forEach(key => {
                if (settings[key] instanceof File) {
                    formData.append(key, settings[key]);
                } else if (settings[key] !== null && settings[key] !== undefined) {
                    formData.append(key, settings[key]);
                }
                formData.append(`${key}_group`, 'academics');
            });

            await axios.post('/api/website/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Academics settings saved successfully');
            fetchData();
        } catch (err) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-serif text-on-surface">Academics Management</h1>
                <p className="text-on-surface-variant mt-1">Manage classes, subjects, and academic calendar</p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-surface-container-low p-6 rounded-2xl border border-outline/20 space-y-6">
                
                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Academic Overview (Rich Text)</label>
                    <TiptapEditor value={settings.academics_overview || ''} onChange={val => setSettings({...settings, academics_overview: val})} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Classes Offered (Rich Text)</label>
                    <TiptapEditor value={settings.academics_classes || ''} onChange={val => setSettings({...settings, academics_classes: val})} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Subjects Curriculum (Rich Text)</label>
                    <TiptapEditor value={settings.academics_subjects || ''} onChange={val => setSettings({...settings, academics_subjects: val})} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Academic Calendar (PDF Upload)</label>
                    <input type="file" accept="application/pdf" onChange={e => { if(e.target.files) setSettings({...settings, academics_calendar_pdf: e.target.files[0]}) }} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" />
                    {typeof settings.academics_calendar_pdf === 'string' && settings.academics_calendar_pdf && (
                        <div className="mt-2 text-sm text-primary">Current calendar uploaded. <a href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/storage/${settings.academics_calendar_pdf}`} target="_blank" rel="noreferrer" className="underline">View PDF</a></div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </form>
        </div>
    );
}
