import OrderItemsTable from '@/components/orders/OrderItemsTable';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatRupiah, formatRupiahInput, parseRupiah } from '@/utils/formatCurrency';
import { Head, Link, useForm } from '@inertiajs/react';

type Client = { id: string; name: string; email?: string; phone_number?: string };
type ServiceLite = { id: string; name: string; base_price?: number | string | null };
type Payment = { id: string; amount: number | string; paid_at?: string | null; method?: string | null };
type Invoice = { id: string; invoice_code: string; amount: number | string; status: string; due_date?: string; payments: Payment[] };
type History = {
    id: string;
    from_status?: string | null;
    to_status: string;
    note?: string | null;
    created_at: string;
    changer?: { id: string; name: string };
};
type ItemRow = { id: string; item_id: string; item_type: string; quantity: number; price: number | string; item?: { id: string; name?: string } };

type PageProps = {
    order: {
        id: string;
        order_code: string;
        status: string;
        final_amount: number | string | null;
        notes?: string | null;
        client?: Client;
        items?: ItemRow[]; // ← made optional for safety
        invoices?: Invoice[]; // ← optional
        statusHistories?: History[]; // ← optional
        created_at: string;
        updated_at: string;
    };
    paid: number;
    due: number;
    statuses?: string[]; // ← optional
    services?: ServiceLite[];
};

const breadcrumbs = (order_code: string): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/admin/orders' },
    { title: order_code, href: `/admin/orders/${order_code}` },
];


export default function Show(props: Readonly<PageProps>) {
    const { order, paid, due } = props;

    // ✅ fallback aman supaya .map tidak meledak
    const statuses: string[] = props.statuses ?? [];
    const items: ItemRow[] = order.items ?? [];
    const histories: History[] = order.statusHistories ?? [];

    // Update order (final_amount, notes) — always controlled
    const form = useForm<{ final_amount: number | string | null }>({
        final_amount: order.final_amount ?? 0,
    });

    // Update status — always controlled
    const statusForm = useForm<{ status: string; note?: string }>({
        status: order.status ?? statuses[0] ?? '',
        note: '',
    });

    // pricetext
    

    return (
        <AppLayout breadcrumbs={breadcrumbs(order.order_code)}>
            <Head title={`Order ${order.order_code}`} />

            <div className="m-4 flex items-center justify-between gap-3">
                <div>
                    <div className="text-xl font-semibold">Order {order.order_code}</div>
                    <div className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString('id-ID')}</div>
                </div>
                <div className="flex gap-2">
                    <Link href={route('admin.orders.index')}>
                        <Button variant="outline">Kembali</Button>
                    </Link>
                    <OrderStatusBadge status={order.status} />
                </div>
            </div>  

            <Separator className="my-4" />

            <div className="m-4 grid gap-4 md:grid-cols-3">
                {/* KIRI: Detail & Update */}
                <Card className="space-y-4 p-4 md:col-span-2">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label>Klien</Label>
                            <div className="mt-1">
                                <div className="font-medium">{order.client?.name ?? '-'}</div>
                                <div className="text-xs text-muted-foreground">{order.client?.email ?? ''}</div>
                            </div>
                        </div>

                        <div>
                            <Label>Status</Label>
                            <div className="mt-1">
                                <OrderStatusBadge status={order.status} />
                            </div>
                        </div>

                        <div>
                            <Label>Final Amount</Label>
                            <div className="mt-1 flex gap-2">
                                <Input
                                    type="text"
                                    inputMode="numeric"
                                    value={formatRupiahInput(form.data.final_amount ?? '')}
                                    onChange={(e) => {
                                        const raw = parseRupiah(e.target.value);
                                        form.setData('final_amount', raw);
                                    }}
                                />
                                <Button
                                    onClick={() => form.put(route('admin.orders.update', order.id), { preserveScroll: true })}
                                    disabled={form.processing}
                                >
                                    Simpan
                                </Button>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">{formatRupiah(form.data.final_amount ?? '')}</div>
                        </div>

                        <div>
                            <Label>Catatan</Label>
                            <div className="mt-2 min-h-[72px] rounded-md border bg-muted/40 p-3 text-sm whitespace-pre-wrap text-muted-foreground">
                                {order.notes?.trim() ? order.notes : '— Tidak ada catatan dari klien —'}
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <OrderItemsTable orderId={order.id} rows={items} services={props.services ?? []} />
                </Card>

                {/* KANAN: Payment/Invoice & Timeline */}
                <div className="space-y-4">
                    <Card className="space-y-3 p-4">
                        <div className="font-semibold">Ringkasan Pembayaran</div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Final Amount</span>
                            <span>{formatRupiah(order.final_amount ?? 0)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Sudah Dibayar</span>
                            <span>{formatRupiah(paid)}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span>Sisa</span>
                            <span className="font-semibold">{formatRupiah(due)}</span>
                        </div>
                    </Card>

                    <Card className="space-y-3 p-4">
                        <div className="font-semibold">Ubah Status</div>
                        <div className="flex gap-2">
                            <Select value={statusForm.data.status} onValueChange={(v) => statusForm.setData('status', v)}>
                                <SelectTrigger className="w-56">
                                    <SelectValue placeholder="Pilih status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {statuses.map((s) => (
                                        <SelectItem value={s} key={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Textarea
                            placeholder="Catatan (opsional)"
                            value={statusForm.data.note ?? ''}
                            onChange={(e) => statusForm.setData('note', e.target.value ?? '')}
                        />
                        <Button
                            onClick={() => statusForm.patch(route('admin.orders.update-status', order.id), { preserveScroll: true })}
                            disabled={statusForm.processing}
                        >
                            Simpan Status
                        </Button>
                    </Card>
                </div>
            </div>
            <Card className="mx-4 mb-4 space-y-3 p-4">
                <div className="font-semibold">Timeline</div>
                <div className="space-y-3">
                    {histories.map((h) => (
                        <div key={h.id} className="text-sm">
                            <div className="font-medium">
                                {h.from_status ?? '—'} → <span className="underline">{h.to_status}</span>
                            </div>
                            {h.note && <div className="text-muted-foreground">{h.note}</div>}
                            <div className="text-xs text-muted-foreground">
                                {new Date(h.created_at).toLocaleString('id-ID')} • {h.changer?.name ?? 'System'}
                            </div>
                        </div>
                    ))}
                    {histories.length === 0 && <div className="text-sm text-muted-foreground">Belum ada histori.</div>}
                </div>
            </Card>
        </AppLayout>
    );
}
