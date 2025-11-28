import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatRupiah } from '@/utils/formatCurrency';
import { useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import AddItemDialog from './items/AddItemDialog';
import EditItemDialog from './items/EditItemDialog';

type ItemRow = {
    id: string;
    item_id: string;
    item_type: string;
    quantity: number;
    price: number | string;
    item?: { id: string; name?: string };
};

type ServiceLite = { id: string; name: string; base_price?: number | string | null };

export default function OrderItemsTable({
    orderId,
    rows,
    services,
}: {
    readonly orderId: string;
    readonly rows: readonly ItemRow[];
    readonly services: readonly ServiceLite[];
}) {
    const [editing, setEditing] = useState<ItemRow | null>(null);
    const rmForm = useForm({});

    const subtotal = useMemo(() => rows.reduce((acc, r) => acc + Number(r.quantity) * Number(r.price || 0), 0), [rows]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="font-semibold">Items</div>
                <AddItemDialog orderId={orderId} services={services} />
            </div>

            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Harga</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {rows.map((r) => {
                            const priceNum = Number(r.price || 0);
                            const sub = priceNum * Number(r.quantity);
                            return (
                                <TableRow key={r.id}>
                                    <TableCell>{r.item?.name ?? r.item_id}</TableCell>
                                    <TableCell className="text-right">{r.quantity}</TableCell>
                                    <TableCell className="text-right">{formatRupiah(priceNum)}</TableCell>
                                    <TableCell className="text-right">{formatRupiah(sub)}</TableCell>
                                    <TableCell className="text-right">
                                        <Button size="sm" variant="outline" className="mr-2" onClick={() => setEditing(r)}>
                                            Edit
                                        </Button>
                                        <ConfirmDialog
                                            title="Hapus Item?"
                                            description="Item akan dihapus dari order ini."
                                            action={() =>
                                                rmForm.delete(route('admin.orders.items.remove', { order: orderId, orderItem: r.id }), {
                                                    preserveScroll: true,
                                                })
                                            }
                                        >
                                            <Button size="sm" variant="destructive">
                                                Hapus
                                            </Button>
                                        </ConfirmDialog>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                                    Belum ada item
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex items-center justify-end gap-4">
                <div className="text-sm text-muted-foreground">Subtotal</div>
                <div className="text-right font-semibold">{formatRupiah(subtotal)}</div>
            </div>

            <EditItemDialog
                orderId={orderId}
                editing={editing ? { id: editing.id, quantity: editing.quantity, price: editing.price } : null}
                onClose={() => setEditing(null)}
            />
        </div>
    );
}
