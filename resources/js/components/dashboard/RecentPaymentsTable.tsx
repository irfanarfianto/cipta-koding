import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type RecentPayment = {
    id: string;
    amount: string | number;
    method?: string | null;
    paid_at?: string | null;
    invoice?: { id?: string; invoice_code?: string };
    order?: { id?: string; order_code?: string };
    client?: { id?: string; name?: string };
};

type RecentPaymentsTableProps = {
    readonly rows: ReadonlyArray<RecentPayment>;
    readonly formatCurrency: (n: number) => string;
};

export default function RecentPaymentsTable({ rows, formatCurrency }: RecentPaymentsTableProps) {
    return (
        <div className="overflow-hidden rounded-lg border">
            <div className="border-b bg-neutral-50 px-4 py-2 dark:bg-neutral-900">Pembayaran Terakhir</div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tanggal</TableHead>
                            <TableHead>Klien</TableHead>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Metode</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((p) => (
                            <TableRow key={p.id}>
                                <TableCell>{p.paid_at ?? '-'}</TableCell>
                                <TableCell>{p.client?.name ?? '-'}</TableCell>
                                <TableCell className="font-mono">{p.invoice?.invoice_code ?? '-'}</TableCell>
                                <TableCell>{p.order?.order_code ?? '-'}</TableCell>
                                <TableCell>{p.method ?? '-'}</TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(typeof p.amount === 'number' ? p.amount : Number(p.amount) || 0)}
                                </TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center text-neutral-500">
                                    Belum ada pembayaran
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
