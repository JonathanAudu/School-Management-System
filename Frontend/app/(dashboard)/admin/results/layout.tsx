'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ResultsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const tabs = [
        { name: 'Result Entry', href: '/admin/results' },
        { name: 'Result Approvals', href: '/admin/results/approvals' },
        { name: 'Performance Overview', href: '/admin/results/performance' },
        { name: 'Promotions', href: '/admin/results/promotions' },
        { name: 'Grading Scales', href: '/admin/results/grading' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">Results Management</h1>
                    <p className="text-sm text-on-surface-variant mt-1">
                        Manage term results, approvals, student performance, promotions, and grading scales.
                    </p>
                </div>
            </div>

            <div className="border-b border-outline/20 overflow-x-auto">
                <nav className="-mb-px flex space-x-8 min-w-max px-1" aria-label="Tabs">
                    {tabs.map((tab) => {
                        // For exact matching on Results to avoid highlighting all when on a sub-route
                        const isActive = tab.href === '/admin/results' 
                            ? pathname === tab.href || pathname.startsWith(tab.href + '/') && !tabs.some(t => t.href !== '/admin/results' && pathname.startsWith(t.href))
                            : pathname.startsWith(tab.href);
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
