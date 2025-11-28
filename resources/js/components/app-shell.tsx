// AppShell.tsx
import { SidebarProvider } from '@/components/ui/sidebar';
import { SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import React from 'react';

interface AppShellProps {
    children: React.ReactNode;
    variant?: 'header' | 'sidebar';
    className?: string;
}

export function AppShell({ children, variant = 'header', className = '' }: AppShellProps) {
    const isOpen = usePage<SharedData>().props.sidebarOpen;

    if (variant === 'header') {
        // Kunci tinggi & matikan body scroll
        return <div className={`flex h-dvh min-h-0 w-full flex-col overflow-hidden ${className}`}>{children}</div>;
    }

    // === variant: 'sidebar' ===
    return (
        <SidebarProvider defaultOpen={isOpen}>
            {/* Kunci tinggi & matikan body scroll */}
            <div className={`flex h-dvh min-h-0 w-full overflow-hidden ${className}`}>{children}</div>
        </SidebarProvider>
    );
}
