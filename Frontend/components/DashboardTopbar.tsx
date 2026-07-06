'use client';

import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardTopbar({ onMenuClick }: { onMenuClick?: () => void }) {
    const { user } = useAuth();

    if (!user) return null;

    const profilePic = user.profile_picture ? user.profile_picture : null;

    return (
        <header className="bg-surface-container-low border-b border-outline/20 h-16 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-40">
            <div className="flex items-center gap-3">
                <button 
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors focus:outline-none"
                    aria-label="Open Sidebar"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <h2 className="text-lg font-semibold text-on-surface font-serif capitalize hidden sm:block">{user.role} Portal</h2>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-on-surface leading-tight">{user.name}</p>
                    <p className="text-xs text-on-surface-variant capitalize">{user.role}</p>
                </div>
                <Link href="/profile" className="block relative w-10 h-10 rounded-full overflow-hidden bg-surface-container border-2 border-outline/50 shadow-sm hover:border-primary transition-colors">
                    {profilePic ? (
                        <Image src={profilePic} alt={user.name} fill sizes="40px" className="object-cover" />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full text-lg text-on-surface font-bold bg-surface-container">
                            {user.name.charAt(0)}
                        </div>
                    )}
                </Link>
            </div>
        </header>
    );
}
