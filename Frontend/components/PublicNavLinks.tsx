'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function PublicNavLinks({ isMobile = false }: { isMobile?: boolean }) {
    const pathname = usePathname();

    const links = [
        { href: '/about', label: 'About Us' },
        { href: '/admissions', label: 'Admissions' },
        { href: '/academics', label: 'Academics' },
        { href: '/student-life', label: 'Student Life' },
        { href: '/gallery', label: 'Gallery' },
        { href: '/news', label: 'News' },
    ];

    return (
        <nav className={`font-medium ${isMobile ? 'flex flex-col gap-6 text-lg' : 'hidden md:flex items-center gap-8 text-sm'}`}>
            {links.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`transition-colors ${isActive ? 'text-sky-600 font-bold' : 'text-slate-600 hover:text-sky-500'}`}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}
