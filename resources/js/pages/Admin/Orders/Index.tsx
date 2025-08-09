import OrderFilters from '@/components/orders/OrderFilters';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

type ClientLite = { id: string; name: string };
type OrderRow = {
    id: string;
    order_code: string;
    status: string;
    final_amount: string | number | null;
    created_at: string;
    client?: { id: string; name: string; email: string };
};

type PageProps = {
    orders: {
        data: OrderRow[];
        links: { url: string | null; label: string; active: boolean }[];
        current_page: number;
        last_page: number;
    };
    filters: {
        status?: string | null;
        client_id?: string | null;
        date_from?: string | null;
        date_to?: string | null;
        search?: string | null;
        per_page?: number | null;
        sort?: string | null;
    };
    statuses: string[];
    clients: ClientLite[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/admin/orders' },
];

function formatCurrency(n: number | string | null | undefined) {
    const num = typeof n === 'string' ? parseFloat(n) : (n ?? 0);
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
}

export default function Index(props: Readonly<PageProps>) {
    const { orders, filters, statuses, clients } = props;
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => setSelected([]), [orders.current_page, filters]); // reset selection on navigation

    const { data, setData, processing } = useForm<{ ids: string[]; status: string; note?: string }>({
        ids: [],
        status: filters.status ?? '',
        note: '',
    });

    const exportHref = useMemo(() => {
        const params = new URLSearchParams();
        Object.entries(filters || {}).forEach(([k, v]) => {
            if (v !== null && v !== undefined && v !== '') params.set(k, String(v));
        });
        return `/admin/orders/export?${params.toString()}`;
    }, [filters]);

    const toggleAll = (checked: boolean) => {
        setSelected(checked ? orders.data.map((o) => o.id) : []);
    };

    const bulkUpdate = () => {
        if (!selected.length || !data.status) return;

        router.post(
            route('admin.orders.bulk-status'),
            {
                ids: selected,
                status: data.status,
                note: data.note ?? '',
            },
            {
                preserveScroll: true,
                onSuccess: () => setSelected([]),
            },
        );
    };
    const onFilter = (next: Partial<typeof filters>) => {
        const merged = { ...filters, ...next };
        const params: Record<string, string> = {};
        (Object.entries(merged) as [string, (string | number | null | undefined)][]).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && v.length === 0)) {
                params[k] = String(v);
            }
        });
        router.get(route('admin.orders.index'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Orders" />

            <div className="flex items-center justify-between gap-3 m-4">
                <div className="text-xl font-semibold">Orders</div>
                <div className="flex gap-2">
                    <Link href={route('admin.orders.create')} className="btn btn-primary">
                        <Button>Order Baru</Button>
                    </Link>
                    <a href={exportHref}>
                        <Button variant="outline">Export CSV</Button>
                    </a>
                </div>
            </div>

            <Separator className="my-4" />

            <OrderFilters
                statuses={statuses}
                clients={clients}
                value={{
                    ...filters,
                    status: filters.status ?? undefined,
                    client_id: filters.client_id ?? undefined,
                    date_from: filters.date_from ?? undefined,
                    date_to: filters.date_to ?? undefined,
                    search: filters.search ?? undefined,
                    per_page: filters.per_page ?? undefined,
                    sort: filters.sort ?? undefined,
                }}
                onChange={onFilter}
            />

            <Card className="mt-4 m-4">
                <div className="flex items-center gap-2 p-4">
                    <Select value={data.status} onValueChange={(v) => setData('status', v)}>
                        <SelectTrigger className="w-56">
                            <SelectValue placeholder="Set status…" />
                        </SelectTrigger>
                        <SelectContent>
                            {statuses.map((s) => (
                                <SelectItem key={s} value={s}>
                                    {s}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input className="w-80" placeholder="Catatan (opsional)" value={data.note} onChange={(e) => setData('note', e.target.value)} />
                    <Button disabled={!selected.length || !data.status || processing} onClick={bulkUpdate}>
                        Bulk Update ({selected.length})
                    </Button>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">
                                    <Checkbox
                                        checked={selected.length === orders.data.length && orders.data.length > 0}
                                        onCheckedChange={(v) => toggleAll(Boolean(v))}
                                    />
                                </TableHead>
                                <TableHead>Kode</TableHead>
                                <TableHead>Klien</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Final</TableHead>
                                <TableHead>Tanggal</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.map((o) => {
                                const isChecked = selected.includes(o.id);

                                function handleCheckboxChange(v: boolean) {
                                    setSelected((prev) => (v ? [...prev, o.id] : prev.filter((id) => id !== o.id)));
                                }

                                return (
                                    <TableRow key={o.id}>
                                        <TableCell>
                                            <Checkbox checked={isChecked} onCheckedChange={handleCheckboxChange} />
                                        </TableCell>
                                        <TableCell className="font-mono">{o.order_code}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{o.client?.name ?? '-'}</div>
                                            <div className="text-xs text-muted-foreground">{o.client?.email ?? ''}</div>
                                        </TableCell>
                                        <TableCell>
                                            <OrderStatusBadge status={o.status} />
                                        </TableCell>
                                        <TableCell>{formatCurrency(o.final_amount ?? 0)}</TableCell>
                                        <TableCell>{new Date(o.created_at).toLocaleString('id-ID')}</TableCell>
                                        <TableCell className="text-center">
                                            <Link href={route('admin.orders.show', o.id)}>
                                                <Button size="sm" variant="outline">
                                                    Detail
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                            {orders.data.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                                        Tidak ada data
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination simple */}
                <div className="flex items-center justify-end gap-2 p-4">
                    {orders.links.map((l) => (
                        <Button
                            key={`${l.label}-${l.url ?? 'null'}`}
                            size="sm"
                            variant={l.active ? 'default' : 'outline'}
                            disabled={!l.url}
                            onClick={() => l.url && router.get(l.url, {}, { preserveScroll: true, preserveState: true })}
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    ))}
                </div>
            </Card>
        </AppLayout>
    );
}
