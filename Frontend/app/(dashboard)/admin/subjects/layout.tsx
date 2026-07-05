'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SubjectsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Subject Categories', href: '/admin/subjects/categories' },
        { name: 'General Subjects', href: '/admin/subjects/general' },
        { name: 'Class Assignments', href: '/admin/subjects/assignments' },
        { name: 'Subject Approvals', href: '/admin/subjects/approvals' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Subjects Management</h1>
                    <p className="text-sm text-on-surface-variant mt-1">
                        Manage categories, global subjects, and assign subjects to specific classes.
                    </p>
                </div>
            </div>

            <div className="border-b border-outline/20 overflow-x-auto">
                <nav className="-mb-px flex space-x-8 min-w-max px-1" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const isActive = pathname.startsWith(tab.href);
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                                    ${isActive 
                                        ? 'border-primary text-primary' 
                                        : 'border-transparent text-on-surface-variant hover:text-on-surface hover:border-outline/40'}
                                `}
                            >
                                {tab.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="pt-4">
                {children}
            </div>
        </div>
    );
}
