import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { BreadcrumbItem } from '@/types';
import type { PropsWithChildren } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: PropsWithChildren<{ breadcrumbs?: BreadcrumbItem[] }>) {
    return (
        // Wajib: kunci tinggi & matikan scroll di shell
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="flex min-w-0 flex-1 flex-col overflow-hidden">
                {/* Header di luar area scroll */}
                <AppSidebarHeader breadcrumbs={breadcrumbs} />

                {/* Hanya bagian ini yang scroll */}
                <main className="flex-1 overflow-y-auto px-6 py-4 md:px-8 md:py-6">{children}</main>
            </AppContent>
        </AppShell>
    );
}
