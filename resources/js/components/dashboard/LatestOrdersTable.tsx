import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export type LatestOrder = {
    id: string;
    order_code: string;
    status: string;
    final_amount: string | number | null;
    client?: { id?: string; name?: string; email?: string };
};

type LatestOrdersTableProps = {
    readonly rows: ReadonlyArray<LatestOrder>;
    readonly formatCurrency: (n: number) => string;
};

export default function LatestOrdersTable({ rows, formatCurrency }: LatestOrdersTableProps) {
    return (
        <div className="overflow-hidden rounded-lg border">
            <div className="border-b bg-neutral-50 px-4 py-2 dark:bg-neutral-900">Order Terbaru</div>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Kode</TableHead>
                            <TableHead>Klien</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Final</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((o) => (
                            <TableRow key={o.id}>
                                <TableCell className="font-mono">{o.order_code}</TableCell>
                                <TableCell>
                                    <div className="font-medium">{o.client?.name ?? '-'}</div>
                                    <div className="text-xs text-neutral-500">{o.client?.email ?? ''}</div>
                                </TableCell>
                                <TableCell>{o.status}</TableCell>
                                <TableCell className="text-right">{formatCurrency(typeof o.final_amount === 'number' ? o.final_amount : Number(o.final_amount) || 0)}</TableCell>
                            </TableRow>
                        ))}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center text-neutral-500">
                                    Belum ada data
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
