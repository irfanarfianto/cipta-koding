import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type DueInvoice = {
    id: string;
    invoice_code: string;
    amount: string | number;
    due_date: string | null;
    order?: { id?: string; order_code?: string };
    client?: { id?: string; name?: string };
};

type DueInvoicesTableProps = {
    readonly rows: readonly DueInvoice[];
    readonly formatCurrency: (n: number) => string;
};

export default function DueInvoicesTable({ rows, formatCurrency }: DueInvoicesTableProps) {
    return (
        <div className="overflow-hidden rounded-lg border">
            <div className="border-b bg-neutral-50 px-4 py-2 dark:bg-neutral-900">Invoice Jatuh Tempo</div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Order</TableHead>
                            <TableHead>Klien</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                            <TableHead>Jatuh Tempo</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((d) => (
                            <TableRow key={d.id}>
                                <TableCell className="font-mono">{d.invoice_code}</TableCell>
                                <TableCell>{d.order?.order_code}</TableCell>
                                <TableCell>{d.client?.name}</TableCell>
                                <TableCell className="text-right">
                                    {formatCurrency(typeof d.amount === 'number' ? d.amount : Number(d.amount) || 0)}
                                </TableCell>
                                <TableCell>{d.due_date ?? '-'}</TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-neutral-500">
                                    Tidak ada invoice jatuh tempo
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
