'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface GradingScale {
    id?: number;
    min_score: number;
    max_score: number;
    grade: string;
    remark: string;
}

export default function GradingScalePage() {
    const [scales, setScales] = useState<GradingScale[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchScales();
    }, []);

    const fetchScales = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:8000/api/grading-scales', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setScales(res.data);
        } catch (error) {
            toast.error('Failed to load grading scales');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/grading-scales', { scales }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Grading scales updated successfully');
            fetchScales();
        } catch (error) {
            toast.error('Failed to save grading scales');
        } finally {
            setIsSaving(false);
        }
    };

    const updateScale = (index: number, field: keyof GradingScale, value: string | number) => {
        const newScales = [...scales];
        newScales[index] = { ...newScales[index], [field]: value };
        setScales(newScales);
    };

    const addScaleRow = () => {
        setScales([...scales, { min_score: 0, max_score: 0, grade: '', remark: '' }]);
    };

    const removeScaleRow = (index: number) => {
        const newScales = [...scales];
        newScales.splice(index, 1);
        setScales(newScales);
    };

    if (isLoading) return <div className="p-6 text-center text-on-surface-variant animate-pulse">Loading settings...</div>;

    return (
        <div className="space-y-6 pb-20">
            <div className="flex justify-between items-center bg-surface-container rounded-2xl p-6 border border-outline/20">
                <div>
                    <h2 className="text-xl font-bold text-on-surface">Grading Scales</h2>
                    <p className="text-sm text-on-surface-variant mt-1">Configure the global grading scale mapping score ranges to letter grades and remarks.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
                >
                    {isSaving ? 'Saving...' : 'Save Configuration'}
                </button>
            </div>

            <div className="bg-surface-container rounded-2xl border border-outline/20 overflow-hidden">
                <div className="p-4 bg-surface-container-high border-b border-outline/20 flex justify-between items-center">
                    <h3 className="font-semibold text-on-surface">Score Ranges</h3>
                    <button 
                        onClick={addScaleRow}
                        className="px-3 py-1.5 text-xs font-medium bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface rounded-lg transition-colors"
                    >
                        + Add Row
                    </button>
                </div>
                <div className="p-0 overflow-x-auto">
                    <table className="w-full text-left text-sm min-w-[700px]">
                        <thead className="bg-surface-container-highest/30 text-on-surface-variant">
                            <tr>
                                <th className="px-6 py-3 font-medium">Min Score</th>
                                <th className="px-6 py-3 font-medium">Max Score</th>
                                <th className="px-6 py-3 font-medium">Grade (e.g., A)</th>
                                <th className="px-6 py-3 font-medium">Remark (e.g., Excellent)</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-outline/10">
                            {scales.map((scale, index) => (
                                <tr key={index} className="hover:bg-surface-container-high/30 transition-colors">
                                    <td className="px-6 py-3">
                                        <input 
                                            type="number" 
                                            value={scale.min_score} 
                                            onChange={(e) => updateScale(index, 'min_score', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline/20 rounded focus:outline-none focus:border-primary text-on-surface"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input 
                                            type="number" 
                                            value={scale.max_score} 
                                            onChange={(e) => updateScale(index, 'max_score', parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline/20 rounded focus:outline-none focus:border-primary text-on-surface"
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input 
                                            type="text" 
                                            value={scale.grade} 
                                            onChange={(e) => updateScale(index, 'grade', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline/20 rounded focus:outline-none focus:border-primary text-on-surface font-semibold uppercase text-center"
                                            maxLength={2}
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <input 
                                            type="text" 
                                            value={scale.remark} 
                                            onChange={(e) => updateScale(index, 'remark', e.target.value)}
                                            className="w-full px-3 py-1.5 bg-surface-container-lowest border border-outline/20 rounded focus:outline-none focus:border-primary text-on-surface"
                                        />
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button 
                                            onClick={() => removeScaleRow(index)}
                                            className="text-red-400 hover:text-red-300 font-medium px-2 py-1 bg-red-400/10 hover:bg-red-400/20 rounded transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
