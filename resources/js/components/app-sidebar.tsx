import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
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
import { Badge } from './ui/badge';
type PageProps = { order_pending_count?: number };

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
    const { order_pending_count = 0 } = usePage().props as PageProps;

    // Sisipkan badge hanya untuk item "Orders"
    const itemsWithBadge: NavItem[] = mainNavItems.map((it) =>
        it.title === 'Orders'
            ? {
                  ...it,
                  // tambahkan properti opsional `suffix`
                  // (lihat perubahan di NavMain di bawah)
                  suffix:
                      order_pending_count > 0 ? (
                          <Badge variant="secondary" className="ml-auto">
                              {order_pending_count}
                          </Badge>
                      ) : null,
              }
            : it,
    );
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
                <NavMain items={itemsWithBadge} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
