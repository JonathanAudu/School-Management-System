'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const root = document.documentElement;
        if (root.classList.contains('dark')) {
            setIsDark(true);
        } else {
            // Check local storage or system preference
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                setIsDark(true);
                root.classList.add('dark');
            } else if (savedTheme === 'light') {
                setIsDark(false);
                root.classList.remove('dark');
            } else {
                // If no preference, we can default to dark for this app since the user wanted dark mode previously
                setIsDark(true);
                root.classList.add('dark');
            }
        }
    }, []);

    const toggleTheme = () => {
        const root = document.documentElement;
        if (isDark) {
            root.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            root.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <button 
            onClick={toggleTheme}
            className="flex items-center justify-start gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-on-surface-variant hover:text-white hover:bg-surface-container-high transition-colors w-full"
            title="Toggle theme"
            aria-label="Toggle theme"
        >
            <span className="text-lg">{isDark ? '☀️' : '🌙'}</span>
            {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
    );
}
