'use client';

import { useState, useEffect } from 'react';
import axios from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from './ThemeToggle';

export default function DashboardSidebar({ isOpen = false, onClose }: { isOpen?: boolean, onClose?: () => void }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (user && ['admin', 'staff'].includes(user.role)) {
            axios.get('/api/student-subjects/pending-count')
                .then(res => setPendingCount(res.data.count))
                .catch(err => console.error(err));
        }
    }, [user, pathname]); // re-fetch when pathname changes (e.g. after approval)

    if (!user) return null;

    const navLinks = [
        { name: 'Dashboard', href: `/${user.role}`, icon: '📊', roles: ['admin', 'staff', 'student', 'parent'] },
        { name: 'Students', href: '/admin/students', icon: '🎓', roles: ['admin'] },
        { name: 'Staff', href: '/admin/staff', icon: '👨‍🏫', roles: ['admin'] },
        { name: 'Academics', href: '/admin/academics', icon: '🏫', roles: ['admin'] },
        { name: 'Subjects', href: '/admin/subjects/categories', icon: '📚', roles: ['admin'] },
        { name: 'Result', href: '/admin/results', icon: '✅', roles: ['admin'] },
        { name: 'Website', href: '/admin/website', icon: '🌐', roles: ['admin'] },
        { name: 'My Classes', href: '/student/classes', icon: '📚', roles: ['student'] },
        { name: 'My Grades', href: '/student/grades', icon: 'A+', roles: ['student'] },
        { name: 'Subject Registration', href: '/student/subjects', icon: '📝', roles: ['student'] },
        { name: 'My Children', href: '/parent/children', icon: '👨‍👩‍👧‍👦', roles: ['parent'] },
        { name: 'Settings', href: '/settings', icon: '⚙️', roles: ['admin'] },
        { name: 'Signatures', href: '/admin/settings/signatures', icon: '✍️', roles: ['admin', 'staff'] },
        { name: 'Profile', href: '/profile', icon: '👤', roles: ['admin', 'staff', 'student', 'parent'] },
    ];

    const allowedLinks = navLinks.filter(link => link.roles.includes(user.role));

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-surface-container-lowest text-on-surface-variant min-h-screen flex flex-col h-full overflow-y-auto transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3">
                        <span className="text-2xl">🏛️</span>
                        <div>
                            <span className="block font-serif font-bold text-lg leading-tight text-white">Lumina</span>
                            <span className="block text-[10px] uppercase tracking-widest text-primary font-semibold">Academy</span>
                        </div>
                    </Link>
                    {/* Close button for mobile */}
                    <button 
                        onClick={onClose}
                        className="md:hidden text-on-surface-variant hover:text-white p-1 rounded focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            
            <div className="p-6 pb-2">
                <p className="text-xs font-semibold text-outline uppercase tracking-wider mb-4">Menu</p>
                <nav className="space-y-1">
                    {allowedLinks.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <Link 
                                key={link.name} 
                                href={link.href}
                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary text-on-primary' : 'hover:bg-surface-container-high hover:text-white'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span>{link.icon}</span>
                                    {link.name}
                                </div>
                                {link.name === 'Result' && pendingCount > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {pendingCount > 99 ? '99+' : pendingCount}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-outline/20 flex flex-col gap-2">
                <ThemeToggle />
                <button 
                    onClick={() => logout()} 
                    className="flex flex-1 items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors"
                >
                    <span className="text-lg">🚪</span>
                    Log Out
                </button>
            </div>
        </aside>
        </>
    );
}
