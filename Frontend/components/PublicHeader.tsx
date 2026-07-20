'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicNavLinks from './PublicNavLinks';
import ClientAuthLinks from './ClientAuthLinks';

interface PublicHeaderProps {
    schoolName?: string;
    schoolLogo?: string;
}

export default function PublicHeader({ schoolName, schoolLogo }: PublicHeaderProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <>
        <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group z-50">
                    {schoolLogo ? (
                        <img src={schoolLogo} alt={schoolName || 'School logo'} className="h-9 w-auto object-contain transition-transform group-hover:scale-110" />
                    ) : (
                        <span className="text-3xl transition-transform group-hover:scale-110">🏛️</span>
                    )}
                    <div>
                        <span className="block font-serif font-bold text-xl leading-tight text-slate-900">{schoolName || 'St. Augustine Academy'}</span>
                    </div>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <PublicNavLinks isMobile={false} />
                    <ClientAuthLinks />
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 text-slate-600 z-[60] relative focus:outline-none"
                    aria-label="Toggle Menu"
                >
                    {isMobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    )}
                </button>
            </div>
        </header>

        {/* Mobile Drawer (moved outside header to avoid backdrop-filter containing block issues) */}
        <div
            className={`fixed inset-0 bg-white z-40 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-24 px-6 ${
                isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <div className="flex-1 flex flex-col gap-6" onClick={() => setIsMobileMenuOpen(false)}>
                <PublicNavLinks isMobile={true} />
                <div className="pt-6 border-t border-slate-100">
                    <ClientAuthLinks />
                </div>
            </div>
        </div>
        </>
    );
}
