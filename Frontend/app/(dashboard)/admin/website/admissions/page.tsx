'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import TiptapEditor from '@/components/TiptapEditor';

export default function AdmissionsManagement() {
    const [settings, setSettings] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);
    
    // Fee table state
    const [feeTable, setFeeTable] = useState<{description: string, amount: string, notes: string}[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/website/settings?group=admissions');
            const fetchedSettings: any = {};
            Object.values(res.data.settings).forEach((s: any) => {
                fetchedSettings[s.key] = s.value;
            });
            
            // Set default fee format if not present
            if (!fetchedSettings.admissions_fees_format) {
                fetchedSettings.admissions_fees_format = 'richtext';
            }
            
            setSettings(fetchedSettings);
            
            // Parse fee table JSON
            if (fetchedSettings.admissions_fees_table) {
                try {
                    setFeeTable(JSON.parse(fetchedSettings.admissions_fees_table));
                } catch (e) {
                    setFeeTable([]);
                }
            } else {
                setFeeTable([{ description: 'Tuition Fee', amount: '', notes: '' }]);
            }
        } catch (err) {
            toast.error('Failed to load admissions data');
        }
    };

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const formData = new FormData();
            
            // Clone settings to modify before saving
            const settingsToSave = { ...settings };
            if (settingsToSave.admissions_fees_format === 'table') {
                settingsToSave.admissions_fees_table = JSON.stringify(feeTable);
            }
            
            Object.keys(settingsToSave).forEach(key => {
                if (settingsToSave[key] instanceof File) {
                    formData.append(key, settingsToSave[key]);
                } else if (settingsToSave[key] !== null && settingsToSave[key] !== undefined) {
                    formData.append(key, settingsToSave[key]);
                }
                formData.append(`${key}_group`, 'admissions');
            });

            await axios.post('/api/website/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Admissions settings saved successfully');
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
                <h1 className="text-3xl font-bold font-serif text-on-surface">Admissions Management</h1>
                <p className="text-on-surface-variant mt-1">Manage admission process, requirements, and fees</p>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-surface-container-low p-6 rounded-2xl border border-outline/20 space-y-6">
                
                <div className="flex items-center justify-between p-4 bg-surface-container rounded-lg">
                    <div>
                        <div className="font-bold text-on-surface">Enable Online Applications</div>
                        <div className="text-sm text-on-surface-variant">Allow prospective students to apply online</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settings.admissions_online_enabled === 'true' || settings.admissions_online_enabled === true} onChange={e => setSettings({...settings, admissions_online_enabled: e.target.checked})} />
                        <div className="w-11 h-6 bg-outline/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Application Deadline</label>
                    <input type="date" className="w-full md:w-1/3 px-4 py-2 border border-outline/20 rounded-lg bg-surface-container text-on-surface" value={settings.admissions_deadline || ''} onChange={e => setSettings({...settings, admissions_deadline: e.target.value})} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Admission Process (Rich Text)</label>
                    <TiptapEditor value={settings.admissions_process || ''} onChange={val => setSettings({...settings, admissions_process: val})} />
                </div>

                <div>
                    <label className="block text-sm font-medium text-on-surface mb-2">Requirements (Rich Text)</label>
                    <TiptapEditor value={settings.admissions_requirements || ''} onChange={val => setSettings({...settings, admissions_requirements: val})} />
                </div>

                <div className="border border-outline/20 rounded-xl p-4 bg-surface-container">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-on-surface">Fee Structure</label>
                        <div className="flex gap-2">
                            <button 
                                type="button" 
                                onClick={() => setSettings({...settings, admissions_fees_format: 'richtext'})}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${settings.admissions_fees_format !== 'table' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface'}`}
                            >
                                Rich Text
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setSettings({...settings, admissions_fees_format: 'table'})}
                                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${settings.admissions_fees_format === 'table' ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface'}`}
                            >
                                Tabular Form
                            </button>
                        </div>
                    </div>

                    {settings.admissions_fees_format === 'table' ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-12 gap-2 text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-2">
                                <div className="col-span-5">Description/Item</div>
                                <div className="col-span-3">Amount</div>
                                <div className="col-span-3">Notes/Frequency</div>
                                <div className="col-span-1 text-center">Action</div>
                            </div>
                            {feeTable.map((row, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center bg-surface-container-low p-2 rounded-lg border border-outline/10">
                                    <div className="col-span-5">
                                        <input type="text" value={row.description} onChange={e => {
                                            const newTable = [...feeTable];
                                            newTable[index].description = e.target.value;
                                            setFeeTable(newTable);
                                        }} className="w-full px-3 py-1.5 border border-outline/20 rounded bg-white text-sm" placeholder="e.g. Tuition Fee" />
                                    </div>
                                    <div className="col-span-3">
                                        <input type="text" value={row.amount} onChange={e => {
                                            const newTable = [...feeTable];
                                            newTable[index].amount = e.target.value;
                                            setFeeTable(newTable);
                                        }} className="w-full px-3 py-1.5 border border-outline/20 rounded bg-white text-sm" placeholder="e.g. $500" />
                                    </div>
                                    <div className="col-span-3">
                                        <input type="text" value={row.notes} onChange={e => {
                                            const newTable = [...feeTable];
                                            newTable[index].notes = e.target.value;
                                            setFeeTable(newTable);
                                        }} className="w-full px-3 py-1.5 border border-outline/20 rounded bg-white text-sm" placeholder="e.g. Per Term" />
                                    </div>
                                    <div className="col-span-1 text-center">
                                        <button type="button" onClick={() => {
                                            const newTable = feeTable.filter((_, i) => i !== index);
                                            setFeeTable(newTable);
                                        }} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Remove row">🗑️</button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={() => setFeeTable([...feeTable, { description: '', amount: '', notes: '' }])} className="text-sm text-primary font-medium flex items-center gap-1 mt-2 hover:underline">
                                + Add Row
                            </button>
                        </div>
                    ) : (
                        <TiptapEditor value={settings.admissions_fees || ''} onChange={val => setSettings({...settings, admissions_fees: val})} />
                    )}
                </div>

                <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium">{isSaving ? 'Saving...' : 'Save Changes'}</button>
                </div>
            </form>
        </div>
    );
}
