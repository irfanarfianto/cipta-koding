import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

type MetricKey = 'total_orders' | 'new_orders' | 'unpaid_invoices' | 'total_revenue' | 'total_clients' | 'active_services';

type DashboardProps = {
    metrics: Record<MetricKey, number>;
    charts: {
        monthly_revenue: { ym: string; total: number }[];
        order_status_distribution: { status: string; total: number }[];
    };
    latest_orders: {
        id: string;
        order_code: string;
        status: string;
        final_amount: string | number | null;
        client: { id?: string; name?: string; email?: string };
        created_at?: string;
    }[];
    due_invoices: {
        id: string;
        invoice_code: string;
        amount: string | number;
        due_date: string | null;
        order: { id?: string; order_code?: string };
        client: { id?: string; name?: string };
    }[];
    recent_payments: {
        id: string;
        amount: string | number;
        method?: string | null;
        paid_at?: string | null;
        invoice: { id?: string; invoice_code?: string };
        order: { id?: string; order_code?: string };
        client: { id?: string; name?: string };
    }[];
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

    // Data ringkas untuk chart tanpa lib (placeholder — kamu bisa ganti ke Recharts)
    const revLabels = useMemo(() => charts.monthly_revenue.map((d) => d.ym), [charts.monthly_revenue]);
    const revValues = useMemo(() => charts.monthly_revenue.map((d) => d.total), [charts.monthly_revenue]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Top cards */}
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Total Orders */}
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 flex h-full flex-col justify-between">
                            <div className="text-sm text-neutral-500">Total Order</div>
                            <div className="text-4xl font-semibold">{metrics.total_orders}</div>
                            <div className="text-xs text-neutral-500">Semua status</div>
                        </div>
                    </div>

                    {/* New Orders */}
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 flex h-full flex-col justify-between">
                            <div className="text-sm text-neutral-500">Order Baru</div>
                            <div className="text-4xl font-semibold">{metrics.new_orders}</div>
                            <div className="text-xs text-neutral-500">Status: Menunggu Konfirmasi</div>
                        </div>
                    </div>

                    {/* Unpaid & Revenue */}
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 p-4 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                        <div className="relative z-10 grid h-full grid-rows-2 gap-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs text-neutral-500">Invoice Belum Dibayar</div>
                                    <div className="text-2xl font-semibold">{metrics.unpaid_invoices}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-neutral-500">Pendapatan</div>
                                    <div className="text-2xl font-semibold">{formatCurrency(metrics.total_revenue)}</div>
                                </div>
                            </div>
                            <div className="flex items-end justify-between text-xs text-neutral-500">
                                <span>Klien: {metrics.total_clients}</span>
                                <span>Layanan Aktif: {metrics.active_services}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom area */}
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 p-4 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    <div className="relative z-10 grid gap-4 md:grid-cols-2">
                        {/* Latest Orders */}
                        <div className="overflow-hidden rounded-lg border">
                            <div className="border-b bg-neutral-50 px-4 py-2 dark:bg-neutral-900">Order Terbaru</div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-neutral-50 dark:bg-neutral-900">
                                        <tr>
                                            <th className="p-2 text-left">Kode</th>
                                            <th className="p-2 text-left">Klien</th>
                                            <th className="p-2 text-left">Status</th>
                                            <th className="p-2 text-right">Final</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latest_orders.map((o) => (
                                            <tr key={o.id} className="border-t">
                                                <td className="p-2 font-mono">{o.order_code}</td>
                                                <td className="p-2">
                                                    <div className="font-medium">{o.client?.name ?? '-'}</div>
                                                    <div className="text-xs text-neutral-500">{o.client?.email ?? ''}</div>
                                                </td>
                                                <td className="p-2">{o.status}</td>
                                                <td className="p-2 text-right">{formatCurrency(o.final_amount ?? 0)}</td>
                                            </tr>
                                        ))}
                                        {latest_orders.length === 0 && (
                                            <tr>
                                                <td className="p-4 text-center text-neutral-500" colSpan={4}>
                                                    Belum ada data
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Due Invoices */}
                        <div className="overflow-hidden rounded-lg border">
                            <div className="border-b bg-neutral-50 px-4 py-2 dark:bg-neutral-900">Invoice Jatuh Tempo</div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-neutral-50 dark:bg-neutral-900">
                                        <tr>
                                            <th className="p-2 text-left">Invoice</th>
                                            <th className="p-2 text-left">Order</th>
                                            <th className="p-2 text-left">Klien</th>
                                            <th className="p-2 text-right">Jumlah</th>
                                            <th className="p-2 text-left">Jatuh Tempo</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {due_invoices.map((d) => (
                                            <tr key={d.id} className="border-t">
                                                <td className="p-2 font-mono">{d.invoice_code}</td>
                                                <td className="p-2">{d.order?.order_code}</td>
                                                <td className="p-2">{d.client?.name}</td>
                                                <td className="p-2 text-right">{formatCurrency(d.amount)}</td>
                                                <td className="p-2">{d.due_date ?? '-'}</td>
                                            </tr>
                                        ))}
                                        {due_invoices.length === 0 && (
                                            <tr>
                                                <td className="p-4 text-center text-neutral-500" colSpan={5}>
                                                    Tidak ada invoice jatuh tempo
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Recent Payments (penuh lebar) */}
                        <div className="overflow-hidden rounded-lg border md:col-span-2">
                            <div className="border-b bg-neutral-50 px-4 py-2 dark:bg-neutral-900">Pembayaran Terakhir</div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-neutral-50 dark:bg-neutral-900">
                                        <tr>
                                            <th className="p-2 text-left">Tanggal</th>
                                            <th className="p-2 text-left">Klien</th>
                                            <th className="p-2 text-left">Invoice</th>
                                            <th className="p-2 text-left">Order</th>
                                            <th className="p-2 text-left">Metode</th>
                                            <th className="p-2 text-right">Jumlah</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recent_payments.map((p) => (
                                            <tr key={p.id} className="border-t">
                                                <td className="p-2">{p.paid_at ?? '-'}</td>
                                                <td className="p-2">{p.client?.name ?? '-'}</td>
                                                <td className="p-2 font-mono">{p.invoice?.invoice_code ?? '-'}</td>
                                                <td className="p-2">{p.order?.order_code ?? '-'}</td>
                                                <td className="p-2">{p.method ?? '-'}</td>
                                                <td className="p-2 text-right">{formatCurrency(p.amount)}</td>
                                            </tr>
                                        ))}
                                        {recent_payments.length === 0 && (
                                            <tr>
                                                <td className="p-4 text-center text-neutral-500" colSpan={6}>
                                                    Belum ada pembayaran
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* (Opsional) Placeholder grafis revenue sederhana */}
                        <div className="overflow-hidden rounded-lg border p-4 md:col-span-2">
                            <div className="mb-2 text-sm font-medium">Pendapatan Bulanan (12 bln)</div>
                            <div className="grid h-32 grid-cols-12 items-end gap-2">
                                {revValues.map((v, i) => {
                                    const max = Math.max(1, ...revValues);
                                    const h = Math.round((v / max) * 100);
                                    return (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                            <div className="w-full bg-neutral-300 dark:bg-neutral-700" style={{ height: `${h}%` }} />
                                            <div className="text-[10px] text-neutral-500">{revLabels[i].slice(2)}</div>
                                        </div>
                                    );
                                })}
                                {revValues.length === 0 && <div className="text-sm text-neutral-500">Belum ada data pembayaran</div>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
