'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';
import { getImageUrl } from "@/lib/utils";

export default function SignaturesSettingsPage() {
    const { user } = useAuth();
    const [principalSignature, setPrincipalSignature] = useState<File | null>(null);
    const [principalSignaturePreview, setPrincipalSignaturePreview] = useState<string | null>(null);
    const [isSavingPrincipal, setIsSavingPrincipal] = useState(false);

    const [mySignature, setMySignature] = useState<File | null>(null);
    const [mySignaturePreview, setMySignaturePreview] = useState<string | null>(null);
    const [isSavingMine, setIsSavingMine] = useState(false);

    useEffect(() => {
        fetchSettings();
        fetchMyProfile();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get('/api/website/settings', { params: { group: 'signatures' } });
            const settings = res.data.settings;
            if (settings.principal_signature) {
                setPrincipalSignaturePreview(getImageUrl(settings.principal_signature.value));
            }
        } catch (error) {
            console.error("Failed to load website settings", error);
        }
    };

    const fetchMyProfile = async () => {
        try {
            const res = await axios.get('/api/user');
            if (res.data.signature) {
                setMySignaturePreview(getImageUrl(res.data.signature));
            }
        } catch (error) {
            console.error("Failed to load user profile", error);
        }
    };

    const handlePrincipalSignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPrincipalSignature(file);
            setPrincipalSignaturePreview(URL.createObjectURL(file));
        }
    };

    const handleMySignatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setMySignature(file);
            setMySignaturePreview(URL.createObjectURL(file));
        }
    };

    const savePrincipalSignature = async () => {
        if (!principalSignature) {
            toast.error('Please select an image first.');
            return;
        }

        setIsSavingPrincipal(true);
        const formData = new FormData();
        formData.append('principal_signature', principalSignature);
        formData.append('principal_signature_group', 'signatures');

        try {
            await axios.post('/api/website/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Principal signature saved successfully!');
            fetchSettings();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to save principal signature. Check file size.';
            toast.error(msg);
        } finally {
            setIsSavingPrincipal(false);
        }
    };

    const saveMySignature = async () => {
        if (!mySignature) {
            toast.error('Please select an image first.');
            return;
        }

        setIsSavingMine(true);
        const formData = new FormData();
        formData.append('signature', mySignature);

        try {
            await axios.post('/api/profile', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Your signature saved successfully!');
            fetchMyProfile();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to save your signature. Check file size.';
            toast.error(msg);
        } finally {
            setIsSavingMine(false);
        }
    };

    return (
        <div className="container mx-auto px-6 py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-serif text-on-surface">Digital Signatures</h1>
                <p className="text-on-surface-variant mt-1">Manage the signatures that will appear on student report cards.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                
                {/* My Signature (Form Master) */}
                <div className="bg-surface-container-low border border-outline/20 p-6 rounded-2xl shadow-sm">
                    <h2 className="text-xl font-bold text-on-surface mb-2">My Signature (Form Teacher)</h2>
                    <p className="text-sm text-on-surface-variant mb-6">Upload your personal signature. This will be used on the report cards for the classes assigned to you.</p>

                    <div className="mb-6 flex justify-center bg-surface-container-highest border-2 border-dashed border-outline/30 rounded-xl p-4 h-40 items-center">
                        {mySignaturePreview ? (
                            <img src={mySignaturePreview} alt="My Signature" className="max-h-full max-w-full object-contain" />
                        ) : (
                            <div className="text-on-surface-variant flex flex-col items-center">
                                <span className="text-3xl mb-2">✍️</span>
                                <span>No signature uploaded yet</span>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleMySignatureChange} 
                                className="block w-full text-sm text-on-surface-variant
                                    file:mr-4 file:py-2 file:px-4
                                    file:rounded-full file:border-0
                                    file:text-sm file:font-semibold
                                    file:bg-primary/10 file:text-primary
                                    hover:file:bg-primary/20"
                            />
                        </div>
                        <button 
                            onClick={saveMySignature}
                            disabled={!mySignature || isSavingMine}
                            className="w-full py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isSavingMine ? 'Saving...' : 'Upload & Save My Signature'}
                        </button>
                    </div>
                </div>

                {/* Principal Signature (Global) - Admin Only */}
                {user?.role === 'admin' && (
                    <div className="bg-surface-container-low border border-outline/20 p-6 rounded-2xl shadow-sm">
                        <h2 className="text-xl font-bold text-on-surface mb-2">Principal's Signature</h2>
                        <p className="text-sm text-on-surface-variant mb-6">Upload the global Principal signature. This appears on all report cards school-wide.</p>

                        <div className="mb-6 flex justify-center bg-surface-container-highest border-2 border-dashed border-outline/30 rounded-xl p-4 h-40 items-center">
                            {principalSignaturePreview ? (
                                <img src={principalSignaturePreview} alt="Principal Signature" className="max-h-full max-w-full object-contain" />
                            ) : (
                                <div className="text-on-surface-variant flex flex-col items-center">
                                    <span className="text-3xl mb-2">🎓</span>
                                    <span>No principal signature uploaded</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handlePrincipalSignatureChange} 
                                    className="block w-full text-sm text-on-surface-variant
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-full file:border-0
                                        file:text-sm file:font-semibold
                                        file:bg-primary/10 file:text-primary
                                        hover:file:bg-primary/20"
                                />
                            </div>
                            <button 
                                onClick={savePrincipalSignature}
                                disabled={!principalSignature || isSavingPrincipal}
                                className="w-full py-2 bg-primary text-on-primary rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isSavingPrincipal ? 'Saving...' : 'Upload & Save Principal Signature'}
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
