import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Receipt,
    Settings,
    ShoppingCart,
    Users,
    Wrench,
    Folder,
    FileText,
    Tag,
    MessageSquareQuote,
    ChevronDown,
    CreditCard,
    BarChart3,
} from 'lucide-react';
import AppLogo from './app-logo';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type PageProps = { order_pending_count?: number };

const mainNavItems: NavItem[] = [
    { title: 'Dashboard', href: '/admin', icon: LayoutGrid },

    // Transaksi Utama
    { title: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { title: 'Invoices', href: '/admin/invoices', icon: Receipt },
    { title: 'Payments', href: '/admin/payments', icon: CreditCard },

    // Manajemen
    { title: 'Clients', href: '/admin/clients', icon: Users },
    { title: 'Services', href: '/admin/services', icon: Wrench },
    { title: 'Reports', href: '/admin/reports', icon: BarChart3 },
    
    // System
    { title: 'Settings', href: '/profile', icon: Settings },
];

const contentNavItems: NavItem[] = [
    { title: 'Portfolio', href: '/admin/portfolio', icon: Folder },
    { title: 'Posts', href: '/admin/posts', icon: FileText },
    { title: 'Tags', href: '/admin/tags', icon: Tag },
    { title: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
];

export function AppSidebar() {
    const page = usePage();
    const { order_pending_count = 0 } = page.props as PageProps;

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
                            <Link href="/admin" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>

                <SidebarGroup className="px-2 py-0">
                <NavMain items={itemsWithBadge} />
                <SidebarMenu>
                        <Collapsible defaultOpen className="group/collapsible">
                            <SidebarMenuItem>
                                <CollapsibleTrigger asChild>
                                    <SidebarMenuButton tooltip="Content Management">
                                        <Folder />
                                        <span>Content Management</span>
                                        <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                                    </SidebarMenuButton>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                    <SidebarMenuSub>
                                        {contentNavItems.map((item) => (
                                            <SidebarMenuSubItem key={item.title}>
                                                <SidebarMenuSubButton asChild isActive={page.url.startsWith(item.href)}>
                                                    <Link href={item.href}>
                                                        {item.icon && <item.icon />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        ))}
                                    </SidebarMenuSub>
                                </CollapsibleContent>
                            </SidebarMenuItem>
                        </Collapsible>
                    </SidebarMenu>
                    
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
