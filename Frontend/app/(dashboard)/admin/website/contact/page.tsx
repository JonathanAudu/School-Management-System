'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ContactManagement() {
    const [settings, setSettings] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/website/settings?group=contact');
            const fetchedSettings: any = {};
            Object.values(res.data.settings).forEach((s: any) => {
                fetchedSettings[s.key] = s.value;
            });
            setSettings(fetchedSettings);
        } catch (err) {
            toast.error('Failed to load contact data');
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            Object.keys(settings).forEach(key => {
                if (settings[key] !== null && settings[key] !== undefined) {
                    formData.append(key, settings[key]);
                }
                formData.append(`${key}_group`, 'contact');
            });

            await axios.post('/api/website/settings', formData);
            toast.success('Contact settings saved successfully');
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
                <h1 className="text-3xl font-bold font-serif text-on-surface">Contact Us Management</h1>
                <p className="text-on-surface-variant mt-1">Manage school address, phones, email, and Google Maps embed</p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-surface-container-low p-6 rounded-2xl border border-outline/20 space-y-6">
                
                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">School Address</label>
                    <textarea rows={3} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.contact_address || ''} onChange={e => setSettings({...settings, contact_address: e.target.value})} placeholder="123 Education Lane, Learning City"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Primary Phone</label>
                        <input type="text" className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.contact_phone || ''} onChange={e => setSettings({...settings, contact_phone: e.target.value})} placeholder="+1 234 567 8900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Secondary Phone (Optional)</label>
                        <input type="text" className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.contact_phone_alt || ''} onChange={e => setSettings({...settings, contact_phone_alt: e.target.value})} placeholder="+1 234 567 8901" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Email Address</label>
                    <input type="email" className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.contact_email || ''} onChange={e => setSettings({...settings, contact_email: e.target.value})} placeholder="info@school.edu" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Google Maps Embed URL</label>
                    <textarea rows={3} className="w-full px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface font-mono text-sm" value={settings.contact_map_embed || ''} onChange={e => setSettings({...settings, contact_map_embed: e.target.value})} placeholder="<iframe src='...' ...></iframe>"></textarea>
                    <p className="text-xs text-on-surface-variant mt-1">Paste the embed HTML code from Google Maps here.</p>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </form>
        </div>
    );
}
