import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

import DueInvoicesTable, { DueInvoice } from '@/components/dashboard/DueInvoicesTable';
import LatestOrdersTable, { LatestOrder } from '@/components/dashboard/LatestOrdersTable';
import MetricCard from '@/components/dashboard/MetricCard';
import RecentPaymentsTable, { RecentPayment } from '@/components/dashboard/RecentPaymentsTable';
import RevenueAreaMonthly from '@/components/dashboard/RevenueChart';
// Jika komponenmu bernama RevenueAreaMonthly:
// Jika kamu menamai filenya RevenueChart dan export default-nya RevenueChart,
// ganti import di atas ke: import RevenueChart from '@/components/dashboard/RevenueChart';

type MetricKey = 'total_orders' | 'new_orders' | 'unpaid_invoices' | 'total_revenue' | 'total_clients' | 'active_services';

type DashboardProps = {
    metrics: Record<MetricKey, number>;
    charts: {
        monthly_revenue: { ym: string; total: number }[];
        order_status_distribution: { status: string; total: number }[];
    };
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
    const { metrics, charts, latest_orders, due_invoices, recent_payments } = props;

    const years = useMemo(() => {
        const set = new Set<number>();
        charts.monthly_revenue.forEach(({ ym }) => {
            const y = parseInt(ym.split('-')[0], 10);
            if (!Number.isNaN(y)) set.add(y);
        });
        return Array.from(set).sort((a, b) => b - a);
    }, [charts.monthly_revenue]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Top cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <MetricCard title="Total Order" value={metrics.total_orders} subtitle="Semua status" />
                    <MetricCard title="Order Baru" value={metrics.new_orders} subtitle="Status: Menunggu Konfirmasi" />
                    <MetricCard
                        title="Invoice & Pendapatan"
                        value={formatCurrency(metrics.total_revenue)}
                        rightSlot={<span className="text-xs text-neutral-500">Unpaid: {metrics.unpaid_invoices}</span>}
                        subtitle={`Klien: ${metrics.total_clients} • Layanan Aktif: ${metrics.active_services}`}
                    />
                </div>

                {/* Bottom area */}
                <div className="relative min-h-[100vh] flex-1 space-y-4 overflow-hidden md:min-h-min">
                    {/* Chart revenue (pakai komponen dengan filter tahun) */}
                    <RevenueAreaMonthly
                        data={charts.monthly_revenue} // [{ ym: "2025-01", total: 123 }]
                        years={years}
                        initialYear={null} // atau new Date().getFullYear()
                        currencyFormatter={formatCurrency}
                        title="Pendapatan Bulanan"
                        description="12 bulan terakhir"
                        height={300}
                    />
                    <LatestOrdersTable rows={latest_orders} formatCurrency={formatCurrency} />
                    <DueInvoicesTable rows={due_invoices} formatCurrency={formatCurrency} />

                    {/* <OrderStatusDistributionChart data={charts.order_status_distribution} /> */}
                    <RecentPaymentsTable rows={recent_payments} formatCurrency={formatCurrency} />
                </div>
            </div>
        </AppLayout>
    );
}
