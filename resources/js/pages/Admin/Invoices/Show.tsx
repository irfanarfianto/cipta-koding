import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { formatTanggal } from '@/utils/formatDate';
import { Head, usePage, router } from '@inertiajs/react';

interface Invoice {
    id: number;
    invoice_code: string;
    due_date: string;
    status: string;
    amount: number;
    order?: {
        client?: {
            name?: string;
        };
    };
}

interface PageProps {
    invoice: Invoice;
    [key: string]: unknown;
}

export default function Show() {
    const { props } = usePage<PageProps>();
    const invoice = props.invoice;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Invoices', href: '/admin/invoices' },
                { title: invoice.invoice_code, href: `/admin/invoices/${invoice.id}` },
            ]}
        >
            <Head title={`Invoice ${invoice.invoice_code}`} />

            <div className="flex items-center justify-between px-4 py-3">
                <div>
                    <div className="text-lg font-semibold">Invoice {invoice.invoice_code}</div>
                    <div className="text-sm text-muted-foreground">
                        Jatuh Tempo: {formatTanggal(invoice.due_date)} • Status: {invoice.status}
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                        if (confirm('Send payment reminder?')) {
                            router.post(route('admin.invoices.send-reminder', invoice.id));
                        }
                    }}>
                        Send Reminder
                    </Button>
                    {invoice.status !== 'cancelled' && invoice.status !== 'paid' && (
                        <Button variant="destructive" onClick={() => {
                            if (confirm('Are you sure you want to cancel this invoice?')) {
                                router.post(route('admin.invoices.cancel', invoice.id));
                            }
                        }}>
                            Cancel Invoice
                        </Button>
                    )}
                    <Button asChild>
                        <a href={`/admin/invoices/${invoice.id}/download`}>Download PDF</a>
                    </Button>
                </div>
            </div>

            {/* Info singkat invoice */}
            <div className="px-4 pb-4">
                {/* Preview PDF pakai iframe */}
                <div className="overflow-hidden rounded-md border" style={{ height: '80vh' }}>
                    <iframe
                        src={`/admin/invoices/${invoice.id}/print`}
                        title={`Preview Invoice ${invoice.invoice_code}`}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                    />
                </div>
            </div>
        </AppLayout>
    );
}
