import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { formatTanggal } from '@/utils/formatDate';
import { Head, Link } from '@inertiajs/react';
import { useMemo } from 'react';

type Client = { id: string; name: string };
type InvoiceRow = {
    id: string;
    invoice_code: string;
    type?: string | null;
    status: string;
    amount: number | string;
    due_date?: string | null;
    order?: { id: string; client?: Client | null; total_amount?: number; created_at?: string } | null;
};

type PageProps = {
    invoices: {
        data: InvoiceRow[];
    };
};

export default function Index({ invoices }: Readonly<PageProps>) {
    const groupedRows = useMemo(() => {
        return invoices.data.reduce<Record<string, InvoiceRow[]>>((acc, inv) => {
            const key = inv.order?.id ?? 'tanpa-order';
            if (!acc[key]) acc[key] = [];
            acc[key].push(inv);
            return acc;
        }, {});
    }, [invoices.data]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Invoices', href: '/admin/invoices' }]}>
            <Head title="Invoices" />

            <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(groupedRows).map(([orderId, invoiceList]) => {
                    const clientName = invoiceList[0]?.order?.client?.name ?? '-';
                    const dateOrder = invoiceList[0]?.order?.created_at ? formatTanggal(invoiceList[0].order.created_at) : '-';

                    return (
                        <Card key={orderId} className="space-y-1 p-4">
                            {/* Header Order */}
                            <div>
                                <div className="font-semibold">{clientName}</div>
                                <p className="text-sm text-muted-foreground">{dateOrder}</p>
                            </div>

                            {/* Tombol Invoice */}
                            <div className="flex gap-2">
                                {invoiceList.map((inv) => (
                                    <Link key={inv.id} href={route('admin.invoices.show', inv.id)}>
                                        <Button variant={'ghost'} size={'sm'}>
                                            <div className="text-sm font-semibold">{inv.type ?? 'Invoice'}</div>
                                        </Button>
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    );
                })}
            </div>
        </AppLayout>
    );
}
