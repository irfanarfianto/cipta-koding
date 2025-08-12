import CreateInvoiceDrawer from '@/components/orders/invoices/CreateInvoiceDrawer';
import OrderMainInfo from '@/components/orders/items/OrderMainInfo';
import OrderTimeline from '@/components/orders/items/OrderTimeline';
import PaymentSummary from '@/components/orders/items/PaymentSummary';
import StatusUpdateForm from '@/components/orders/items/StatusUpdateForm';
import OrderItemsTable from '@/components/orders/OrderItemsTable';
import OrderStatusBadge from '@/components/orders/OrderStatusBadge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { formatRupiah } from '@/utils/formatCurrency';
import { Head } from '@inertiajs/react';

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
        items?: ItemRow[];
        invoices?: Invoice[];
        statusHistories?: History[];
        created_at: string;
        updated_at: string;
    };
    paid: number;
    due: number;
    statuses?: string[];
    services?: ServiceLite[];
};

const breadcrumbs = (order_code: string): BreadcrumbItem[] => [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/admin/orders' },
    { title: order_code, href: `/admin/orders/${order_code}` },
];

export default function Show(props: Readonly<PageProps>) {
    const { order, paid, due } = props;

    const statuses: string[] = props.statuses ?? [];
    const items: ItemRow[] = order.items ?? [];
    const histories: History[] = order.statusHistories ?? [];

    return (
        <AppLayout breadcrumbs={breadcrumbs(order.order_code)}>
            <Head title={`Order ${order.order_code}`} />

            {/* Header: stack di mobile, row di md+ */}
            <div className="px-4 pt-4 sm:px-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="text-lg font-semibold sm:text-xl">Order {order.order_code}</div>
                        <div className="flex items-center">
                            <div className="text-xs text-muted-foreground sm:text-sm">{new Date(order.created_at).toLocaleString('id-ID')}</div>
                            <div className="inline-flex items-center md:ml-1">
                                <OrderStatusBadge status={order.status} />
                            </div>
                        </div>
                    </div>

                    <div className="mt-1 flex w-full gap-2 md:mt-0 md:w-auto">
                        {/* <Link href={route('admin.orders.index')} className="w-full md:w-auto">
                            <Button variant="outline" className="w-full md:w-auto">
                                Kembali
                            </Button>
                        </Link> */}
                        <CreateInvoiceDrawer
                            finalAmount={Number(order.final_amount ?? 0)}
                            paid={Number(paid ?? 0)}
                            due={Number(due ?? 0)}
                            dpUrl={route('admin.orders.invoice.dp', order.id)}
                            pelunasanUrl={route('admin.orders.invoice.pelunasan', order.id)}
                            order={{
                                invoices: (order.invoices ?? []).map((inv) => ({
                                    id: inv.id,
                                    invoice_code: inv.invoice_code,
                                    due_date: inv.due_date ?? '',
                                    status: inv.status,
                                    amount: Number(inv.amount ?? 0),
                                })),
                            }}
                        />
                    </div>
                </div>
            </div>

            <Separator className="my-4" />

            {/* Grid utama: 1 kolom di mobile, 2:1 di md+ */}
            <div className="grid gap-4 px-4 pb-4 sm:px-6 md:grid-cols-3">
                {/* KIRI: Detail & Items (span 2 kolom di md+) */}
                <Card className="order-2 space-y-4 p-4 md:order-1 md:col-span-2">
                    <OrderMainInfo orderId={order.id} client={order.client} notes={order.notes} initialFinalAmount={order.final_amount} />

                    {/* Items table (komponen sudah handle responsifnya) */}
                    <OrderItemsTable orderId={order.id} rows={items} services={props.services ?? []} />
                </Card>

                {/* KANAN: Payment & Status (muncul di atas di mobile agar info ringkas terlihat duluan) */}
                <div className="order-1 space-y-4 md:order-2">
                    <PaymentSummary finalAmount={order.final_amount} paid={paid} due={due} formatRupiah={formatRupiah} />

                    <StatusUpdateForm currentStatus={order.status} statuses={statuses} patchUrl={route('admin.orders.update-status', order.id)} />
                </div>
            </div>

            {/* Timeline */}
            <div className="px-4 pb-4 sm:px-6">
                <OrderTimeline histories={histories} />
            </div>
        </AppLayout>
    );
}
