import AdminLayout from '@/layouts/AdminLayout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';
import { Activity, DollarSign, ShoppingCart, Users } from 'lucide-react';

import DueInvoicesTable, { DueInvoice } from '@/components/dashboard/DueInvoicesTable';
import LatestOrdersTable, { LatestOrder } from '@/components/dashboard/LatestOrdersTable';
import MetricCard from '@/components/dashboard/MetricCard';
import RecentPaymentsTable, { RecentPayment } from '@/components/dashboard/RecentPaymentsTable';
import RevenueAreaMonthly from '@/components/dashboard/RevenueChart';
// Jika komponenmu bernama RevenueAreaMonthly:
// Jika kamu menamai filenya RevenueChart dan export default-nya RevenueChart,
// ganti import di atas ke: import RevenueChart from '@/components/dashboard/RevenueChart';

type MetricKey = 'total_orders' | 'new_orders' | 'unpaid_invoices' | 'total_revenue' | 'total_clients' | 'active_services' | 'projects_in_progress' | 'projects_late';

type DashboardProps = {
    metrics: Record<MetricKey, number>;
    charts: {
        monthly_revenue: { ym: string; total: number }[];
        order_status_distribution: { status: string; total: number }[];
    };
    kpi: {
        completion_rate: number;
        collection_rate: number;
        avg_order_value: number;
    };
    popular_services: { name: string; total_sold: number }[];
    latest_orders: LatestOrder[];
    due_invoices: DueInvoice[];
    recent_payments: RecentPayment[];
};

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

function formatCurrency(n: number | string | null | undefined) {
    const num = typeof n === 'string' ? parseFloat(n) : (n ?? 0);
    try {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
    } catch {
        return String(num ?? 0);
    }
}

export default function Dashboard(props: DashboardProps) {
    const { metrics, charts, kpi, popular_services, latest_orders, due_invoices, recent_payments } = props;

    const years = useMemo(() => {
        const set = new Set<number>();
        charts.monthly_revenue.forEach(({ ym }) => {
            const y = parseInt(ym.split('-')[0], 10);
            if (!Number.isNaN(y)) set.add(y);
        });
        return Array.from(set).sort((a, b) => b - a);
    }, [charts.monthly_revenue]);

    return (
        <AdminLayout>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                {/* Top cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <MetricCard 
                        title="Pendapatan Total" 
                        value={formatCurrency(metrics.total_revenue)} 
                        subtitle="Total akumulasi pendapatan"
                        icon={DollarSign}
                    />
                    <MetricCard 
                        title="Order Baru" 
                        value={metrics.new_orders} 
                        subtitle="Menunggu Konfirmasi"
                        icon={ShoppingCart}
                        className="border-blue-200 bg-blue-50"
                    />
                    <MetricCard 
                        title="Tagihan Belum Lunas" 
                        value={metrics.unpaid_invoices} 
                        subtitle="Invoice Unpaid"
                        icon={Activity}
                        className="border-red-200 bg-red-50"
                    />
                    <MetricCard 
                        title="Total Klien" 
                        value={metrics.total_clients} 
                        subtitle={`Layanan Aktif: ${metrics.active_services}`}
                        icon={Users}
                    />
                </div>

                {/* Project Health & Quick Actions */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                     <div className="col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between">
                        <div>
                            <h3 className="font-semibold leading-none tracking-tight text-sm text-muted-foreground">Status Proyek</h3>
                            <div className="mt-4 flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold">{metrics.projects_in_progress}</span>
                                    <span className="text-xs text-muted-foreground">Sedang Dikerjakan</span>
                                </div>
                                <div className="h-8 w-px bg-border"></div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-bold text-red-600">{metrics.projects_late}</span>
                                    <span className="text-xs text-muted-foreground">Terlambat Deadline</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-muted-foreground">
                            Pantau terus deadline proyek agar klien tetap puas.
                        </div>
                     </div>

                     <div className="col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold leading-none tracking-tight text-sm text-muted-foreground mb-4">Shortcut Cepat</h3>
                        <div className="flex flex-wrap gap-2">
                            <a href={route('admin.orders.create')} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2">
                                + Buat Order
                            </a>
                            <a href={route('admin.clients.create')} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2">
                                + Tambah Klien
                            </a>
                        </div>
                     </div>
                </div>

                {/* KPI & Popular Services */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                         <h3 className="font-semibold leading-none tracking-tight text-sm text-muted-foreground mb-4">Performa Bisnis (KPI)</h3>
                         <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Order Completion Rate</span>
                                <span className="text-sm font-bold">{kpi.completion_rate}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                                <div className="h-2 rounded-full bg-primary" style={{ width: `${kpi.completion_rate}%` }}></div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-sm font-medium">Payment Collection Rate</span>
                                <span className="text-sm font-bold">{kpi.collection_rate}%</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-secondary">
                                <div className="h-2 rounded-full bg-green-500" style={{ width: `${kpi.collection_rate}%` }}></div>
                            </div>

                            <div className="pt-4 flex items-center justify-between border-t mt-2">
                                <span className="text-sm text-muted-foreground">Rata-rata Nilai Order</span>
                                <span className="text-lg font-bold">{formatCurrency(kpi.avg_order_value)}</span>
                            </div>
                         </div>
                    </div>

                    <div className="col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                        <h3 className="font-semibold leading-none tracking-tight text-sm text-muted-foreground mb-4">Layanan Terpopuler</h3>
                        <div className="space-y-3">
                            {popular_services.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Belum ada data penjualan.</p>
                            ) : (
                                popular_services.map((svc, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                                {i + 1}
                                            </div>
                                            <span className="text-sm font-medium">{svc.name}</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">{svc.total_sold} terjual</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Charts & Tables Area */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    
                    {/* Revenue Chart - Takes up 4 columns on large screens */}
                    <div className="col-span-4">
                        <RevenueAreaMonthly
                            data={charts.monthly_revenue}
                            years={years}
                            initialYear={null}
                            currencyFormatter={formatCurrency}
                            title="Pendapatan Bulanan"
                            description="Tren pendapatan 12 bulan terakhir"
                            height={350}
                        />
                    </div>

                    {/* Due Invoices - Takes up 3 columns, highly visible */}
                    <div className="col-span-3">
                        <DueInvoicesTable rows={due_invoices} formatCurrency={formatCurrency} />
                    </div>
                </div>

                {/* Bottom Tables */}
                <div className="grid gap-4 md:grid-cols-2">
                    <LatestOrdersTable rows={latest_orders} formatCurrency={formatCurrency} />
                    <RecentPaymentsTable rows={recent_payments} formatCurrency={formatCurrency} />
                </div>
            </div>
        </AdminLayout>
    );
}
