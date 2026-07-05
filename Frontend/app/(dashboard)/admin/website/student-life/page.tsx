'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import TiptapEditor from '@/components/TiptapEditor';

export default function StudentLifeManagement() {
    const [settings, setSettings] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/website/settings?group=student_life');
            const fetchedSettings: any = {};
            Object.values(res.data.settings).forEach((s: any) => {
                fetchedSettings[s.key] = s.value;
            });
            setSettings(fetchedSettings);
        } catch (err) {
            toast.error('Failed to load student life data');
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
                formData.append(`${key}_group`, 'student_life');
            });

            await axios.post('/api/website/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Student life settings saved successfully');
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
                <h1 className="text-3xl font-bold font-serif text-on-surface">Student Life Management</h1>
                <p className="text-on-surface-variant mt-1">Manage clubs, sports, and student achievements</p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-surface-container-low p-6 rounded-2xl border border-outline/20 space-y-6">
                
                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Student Life Overview (Rich Text)</label>
                    <TiptapEditor value={settings.student_life_overview || ''} onChange={val => setSettings({...settings, student_life_overview: val})} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Clubs & Societies (Rich Text)</label>
                    <TiptapEditor value={settings.student_life_clubs || ''} onChange={val => setSettings({...settings, student_life_clubs: val})} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Sports & Athletics (Rich Text)</label>
                    <TiptapEditor value={settings.student_life_sports || ''} onChange={val => setSettings({...settings, student_life_sports: val})} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Student Achievements (Rich Text)</label>
                    <TiptapEditor value={settings.student_life_achievements || ''} onChange={val => setSettings({...settings, student_life_achievements: val})} />
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </form>
        </div>
    );
}
