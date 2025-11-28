import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { formatRupiah } from '@/utils/formatCurrency';
import { formatTanggal } from '@/utils/formatDate';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, XCircle, Trash2, Eye } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Payment = {
    id: string;
    amount: number;
    method: string;
    status: string;
    paid_at: string;
    invoice: {
        id: string;
        invoice_code: string;
        order: {
            client: {
                name: string;
            };
        };
    };
    verified_by?: {
        name: string;
    };
};

type PageProps = {
    payments: {
        data: Payment[];
        links: any[];
    };
    filters: {
        status?: string;
    };
};

export default function Index({ payments, filters }: PageProps) {
    const [status, setStatus] = useState(filters.status || 'all');

    const handleFilterChange = (val: string) => {
        setStatus(val);
        router.get(
            route('admin.payments.index'),
            { status: val === 'all' ? undefined : val },
            { preserveState: true }
        );
    };

    const handleVerify = (id: string, newStatus: string) => {
        if (confirm(`Are you sure you want to mark this payment as ${newStatus}?`)) {
            router.put(route('admin.payments.update', id), { status: newStatus });
        }
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this payment?')) {
            router.delete(route('admin.payments.destroy', id));
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Payments', href: '/admin/payments' }]}>
            <Head title="Payments" />

            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Payment History</h2>
                    <div className="w-[200px]">
                        <Select value={status} onValueChange={handleFilterChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="success">Success</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                                <SelectItem value="refunded">Refunded</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Client</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.data.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            No payments found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    payments.data.map((payment) => (
                                        <TableRow key={payment.id}>
                                            <TableCell>{formatTanggal(payment.paid_at)}</TableCell>
                                            <TableCell>
                                                <Link href={route('admin.invoices.show', payment.invoice.id)} className="hover:underline text-primary">
                                                    {payment.invoice.invoice_code}
                                                </Link>
                                            </TableCell>
                                            <TableCell>{payment.invoice.order.client.name}</TableCell>
                                            <TableCell>{formatRupiah(payment.amount)}</TableCell>
                                            <TableCell className="capitalize">{payment.method}</TableCell>
                                            <TableCell>
                                                <Badge variant={
                                                    payment.status === 'success' ? 'default' :
                                                    payment.status === 'pending' ? 'secondary' :
                                                    payment.status === 'failed' ? 'destructive' : 'outline'
                                                }>
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {payment.status === 'pending' && (
                                                        <>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-600" onClick={() => handleVerify(payment.id, 'success')} title="Approve">
                                                                <CheckCircle className="h-4 w-4" />
                                                            </Button>
                                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleVerify(payment.id, 'failed')} title="Reject">
                                                                <XCircle className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(payment.id)} title="Delete">
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
