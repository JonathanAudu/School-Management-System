'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface SubjectCategory {
    id: number;
    name: string;
    description: string | null;
    status: boolean;
}

export default function SubjectCategoriesPage() {
    const [categories, setCategories] = useState<SubjectCategory[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<SubjectCategory | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: true
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:8000/api/subject-categories', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCategories(response.data);
        } catch (error) {
            toast.error('Failed to load subject categories');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingCategory 
                ? `http://localhost:8000/api/subject-categories/${editingCategory.id}`
                : 'http://localhost:8000/api/subject-categories';
            
            const method = editingCategory ? 'put' : 'post';
            
            await axios[method](url, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
            setIsModalOpen(false);
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save category');
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8000/api/subject-categories/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Category deleted successfully');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    const openModal = (category?: SubjectCategory) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                description: category.description || '',
                status: category.status
            });
        } else {
            setEditingCategory(null);
            setFormData({ name: '', description: '', status: true });
        }
        setIsModalOpen(true);
    };

    if (isLoading) return <div className="p-6 text-center text-on-surface-variant animate-pulse">Loading categories...</div>;

    const filteredCategories = categories.filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalPages = Math.max(1, Math.ceil(filteredCategories.length / itemsPerPage));
    const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-on-surface">Subject Categories</h2>
                <button 
                    onClick={() => openModal()}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                    + Add Category
                </button>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                    className="w-full md:w-64 px-4 py-2 bg-surface-container rounded-lg border border-outline/20 text-sm focus:outline-none focus:border-primary text-on-surface"
                />
            </div>

            <div className="bg-surface-container rounded-2xl border border-outline/20 overflow-hidden overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[600px]">
                    <thead className="bg-surface-container-high text-on-surface-variant">
                        <tr>
                            <th className="px-6 py-4 font-medium">Name</th>
                            <th className="px-6 py-4 font-medium">Description</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline/20">
                        {paginatedCategories.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                                    No categories found.
                                </td>
                            </tr>
                        ) : (
                            paginatedCategories.map(category => (
                                <tr key={category.id} className="hover:bg-surface-container-highest/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-on-surface">{category.name}</td>
                                    <td className="px-6 py-4 text-on-surface-variant">{category.description || '-'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${category.status ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {category.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-3">
                                        <button 
                                            onClick={() => openModal(category)}
                                            className="text-primary hover:text-primary/80 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(category.id)}
                                            className="text-red-400 hover:text-red-300 font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="mt-4 flex justify-between items-center text-sm text-on-surface-variant">
                    <button 
                        disabled={currentPage === 1} 
                        onClick={() => setCurrentPage(p => p - 1)}
                        className="px-3 py-1 border border-outline/20 rounded-md hover:bg-surface-container-high disabled:opacity-50 transition-colors"
                    >
                        Previous
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                        disabled={currentPage === totalPages} 
                        onClick={() => setCurrentPage(p => p + 1)}
                        className="px-3 py-1 border border-outline/20 rounded-md hover:bg-surface-container-high disabled:opacity-50 transition-colors"
                    >
                        Next
                    </button>
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl border border-outline/20 overflow-hidden">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-on-surface">
                                {editingCategory ? 'Edit Category' : 'Add Category'}
                            </h3>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="text-on-surface-variant hover:text-on-surface transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                    className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline/20 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    placeholder="e.g. Science, Arts"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                    className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline/20 text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary h-24 resize-none"
                                    placeholder="Optional description"
                                />
                            </div>
                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={formData.status}
                                        onChange={e => setFormData({...formData, status: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    <span className="ml-3 text-sm font-medium text-on-surface-variant">Active Status</span>
                                </label>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface rounded-lg font-medium hover:bg-surface-container-highest transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
