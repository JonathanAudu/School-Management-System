'use client';

import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ClientAuthLinks() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    if (isLoading) return <div className="w-24 h-8 animate-pulse bg-slate-200 rounded-lg"></div>;

    if (user) {
        return (
            <div className="flex items-center gap-4">
                <Link href={`/${user.role}`} className="text-sm font-medium text-slate-600 hover:text-sky-500 transition-colors">
                    Dashboard
                </Link>
                <Link href="/profile" className="text-sm font-medium text-slate-600 hover:text-sky-500 transition-colors">
                    Profile
                </Link>
                <button 
                    onClick={() => {
                        logout();
                        router.push('/');
                    }} 
                    className="btn-outline py-2 px-5 text-sm"
                >
                    Logout
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-sky-500 transition-colors">Sign In</Link>
        </div>
    );
}
