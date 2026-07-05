'use client';

import Link from 'next/link';

export default function WebsiteManagementPage() {
    const modules = [
        {
            title: 'Homepage',
            description: 'Manage hero slider, welcome message, and quick stats.',
            icon: '🏠',
            href: '/admin/website/homepage'
        },
        {
            title: 'About Us',
            description: 'Edit school history, vision, mission, and leadership.',
            icon: 'ℹ️',
            href: '/admin/website/about'
        },
        {
            title: 'Admissions',
            description: 'Update admission process, requirements, and fees.',
            icon: '📝',
            href: '/admin/website/admissions'
        },
        {
            title: 'Academics',
            description: 'Manage classes offered and subjects.',
            icon: '📚',
            href: '/admin/website/academics'
        },
        {
            title: 'Student Life',
            description: 'Update clubs, sports, and achievements.',
            icon: '⚽',
            href: '/admin/website/student-life'
        },
        {
            title: 'Gallery',
            description: 'Manage photo albums and images.',
            icon: '🖼️',
            href: '/admin/website/gallery'
        },
        {
            title: 'News & Announcements',
            description: 'Post and manage latest news.',
            icon: '📰',
            href: '/admin/website/news'
        },
        {
            title: 'Events',
            description: 'Schedule and display upcoming events.',
            icon: '📅',
            href: '/admin/website/events'
        },
        {
            title: 'Contact Us',
            description: 'Update address, phone, email, and maps.',
            icon: '📞',
            href: '/admin/website/contact'
        }
    ];

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-serif text-on-surface">Website Management</h1>
                <p className="text-on-surface-variant mt-1">Control public website content across all pages</p>
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
