'use client';

import Link from 'next/link';

export default function AcademicsHubPage() {
    const modules = [
        {
            title: 'Academic Sessions',
            description: 'Manage school years (e.g. 2025/2026), start/end dates, and set the active session.',
            icon: '🗓️',
            href: '/admin/academics/sessions'
        },
        {
            title: 'Terms',
            description: 'Manage terms within an academic session and set the current term.',
            icon: '📅',
            href: '/admin/academics/terms'
        },
        {
            title: 'Classes & Forms',
            description: 'Create and manage class levels, arms, capacity, and assign class teachers.',
            icon: '🏫',
            href: '/admin/academics/classes'
        }
    ];

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-serif text-on-surface">Academics Management</h1>
                <p className="text-on-surface-variant mt-1">Configure academic structure, sessions, terms, and classes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {modules.map((module) => (
                    <Link 
                        key={module.title} 
                        href={module.href}
                        className="bg-surface-container-low border border-outline/10 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-primary/30 transition-all group flex flex-col h-full"
                    >
                        <div className="text-4xl mb-4 group-hover:scale-110 transition-transform origin-left">{module.icon}</div>
                        <h3 className="text-xl font-bold text-on-surface mb-2">{module.title}</h3>
                        <p className="text-sm text-on-surface-variant flex-1">{module.description}</p>
                        <div className="mt-4 text-primary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                            Manage <span aria-hidden="true">&rarr;</span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
