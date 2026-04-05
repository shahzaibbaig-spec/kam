import { useEffect, useState } from 'react';

const STORAGE_KEY = 'kort:sidebar-collapsed';

export function useAppShell(defaultCollapsed = false) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultCollapsed);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const storedValue = window.localStorage.getItem(STORAGE_KEY);
        if (storedValue !== null) {
            setSidebarCollapsed(storedValue === '1');
        }
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(STORAGE_KEY, sidebarCollapsed ? '1' : '0');
    }, [sidebarCollapsed]);

    return {
        sidebarCollapsed,
        setSidebarCollapsed,
        toggleSidebarCollapsed: () => setSidebarCollapsed((current) => !current),
        mobileNavOpen,
        setMobileNavOpen,
        toggleMobileNav: () => setMobileNavOpen((current) => !current),
    };
}
