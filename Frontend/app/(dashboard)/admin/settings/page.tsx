'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import Spinner from '@/components/Spinner';
import { getImageUrl } from "@/lib/utils";

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/website/settings?group=general');
            const fetchedSettings: any = {};
            Object.values(res.data.settings).forEach((s: any) => {
                fetchedSettings[s.key] = s.value;
            });
            setSettings(fetchedSettings);
        } catch (err) {
            toast.error('Failed to load school settings');
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
                formData.append(`${key}_group`, 'general');
            });

            await axios.post('/api/website/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('School settings saved successfully');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-serif text-on-surface">Settings</h1>
                <p className="text-on-surface-variant mt-1">General school information shown across the public website and reports.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-surface-container-low p-6 rounded-2xl border border-outline/20 space-y-6">
                <h2 className="text-xl font-bold text-on-surface mb-2">General School Info</h2>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">School Name</label>
                    <input type="text" className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.school_name || ''} onChange={e => setSettings({...settings, school_name: e.target.value})} placeholder="Lumina Academy" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">School Address</label>
                    <textarea rows={3} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.school_address || ''} onChange={e => setSettings({...settings, school_address: e.target.value})} placeholder="123 Education Lane, Lagos, Nigeria"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Phone Number</label>
                        <input type="text" className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.school_phone || ''} onChange={e => setSettings({...settings, school_phone: e.target.value})} placeholder="+234 800 LUMINA" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Email Address</label>
                        <input type="email" className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.school_email || ''} onChange={e => setSettings({...settings, school_email: e.target.value})} placeholder="info@school.edu" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">School Logo</label>
                    {typeof settings.school_logo === 'string' && settings.school_logo && (
                        <div className="mb-3">
                            <img src={getImageUrl(settings.school_logo)} alt="Current logo" className="h-16 w-auto object-contain rounded-lg border border-outline/20 bg-surface p-2" />
                        </div>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => { if (e.target.files) setSettings({ ...settings, school_logo: e.target.files[0] }); }}
                        className="block w-full text-sm text-on-surface-variant
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-primary/10 file:text-primary
                            hover:file:bg-primary/20"
                    />
                    <p className="text-xs text-on-surface-variant mt-1">Shown in the public site header in place of the default icon.</p>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium disabled:opacity-60 flex items-center gap-2">
                        {isSaving && <Spinner />}{isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <div className="mt-6 bg-surface-container-low p-6 rounded-2xl border border-outline/20 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-on-surface">Digital Signatures</h2>
                    <p className="text-sm text-on-surface-variant mt-1">Manage the signatures that appear on student report cards.</p>
                </div>
                <Link href="/admin/settings/signatures" className="px-4 py-2 bg-surface-container-highest text-on-surface rounded-lg text-sm font-medium hover:bg-outline/20 whitespace-nowrap">
                    Manage Signatures →
                </Link>
            </div>
        </div>
    );
}
