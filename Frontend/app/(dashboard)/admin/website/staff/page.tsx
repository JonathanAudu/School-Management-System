'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';

export default function StaffPageManagement() {
    const [settings, setSettings] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/website/settings?group=staff_page');
            const fetchedSettings: any = {};
            Object.values(res.data.settings).forEach((s: any) => {
                fetchedSettings[s.key] = s.value;
            });
            setSettings(fetchedSettings);
        } catch (err) {
            toast.error('Failed to load staff page data');
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
                formData.append(`${key}_group`, 'staff_page');
            });

            await axios.post('/api/website/settings', formData);
            toast.success('Staff page settings saved successfully');
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
                <h1 className="text-3xl font-bold font-serif text-on-surface">Staff Page Management</h1>
                <p className="text-on-surface-variant mt-1">Control how staff are displayed on the public website</p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-surface-container-low p-6 rounded-2xl border border-outline/20 space-y-6">
                
                <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
                    <div>
                        <div className="font-bold text-on-surface">Show Staff Page Publicly</div>
                        <div className="text-sm text-on-surface-variant">If disabled, the "Our Staff" link will be hidden from the public website.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settings.staff_page_enabled === 'true' || settings.staff_page_enabled === true} onChange={e => setSettings({...settings, staff_page_enabled: e.target.checked})} />
                        <div className="w-11 h-6 bg-outline/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
                    <div>
                        <div className="font-bold text-on-surface">Show Contact Info</div>
                        <div className="text-sm text-on-surface-variant">Display staff email addresses on the public profile cards.</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settings.staff_show_email === 'true' || settings.staff_show_email === true} onChange={e => setSettings({...settings, staff_show_email: e.target.checked})} />
                        <div className="w-11 h-6 bg-outline/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Who's Shown</label>
                    <p className="text-sm text-on-surface-variant mb-3">All active staff members are shown on the public Faculty & Staff page, teaching and non-teaching alike.</p>
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </form>
        </div>
    );
}
