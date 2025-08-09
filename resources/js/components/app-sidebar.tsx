import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import {
    CreditCard,
    FileText,
    Folder,
    History,
    LayoutGrid,
    MessageSquareQuote,
    Receipt,
    Settings,
    ShoppingCart,
    Tag as TagIcon,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutGrid },

    // Transaksi
    { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { title: 'Invoices', href: '/admin/invoices', icon: Receipt },
    { title: 'Payments', href: '/admin/payments', icon: CreditCard },

    // Data Master
    { title: 'Clients', href: '/admin/clients', icon: Users },
    { title: 'Services', href: '/admin/services', icon: Wrench },

    // Konten
    { title: 'Portfolio', href: '/admin/portfolio', icon: Folder },
    { title: 'Posts', href: '/admin/posts', icon: FileText },
    { title: 'Tags', href: '/admin/tags', icon: TagIcon },
    { title: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },

    // Utilitas
    { title: 'Audit', href: '/admin/audit', icon: History },
    { title: 'Settings', href: '/admin/settings', icon: Settings },
];


export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
