import PriceInputRupiah from '@/components/shared/PriceInputRupiah';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRupiah } from '@/utils/formatCurrency';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

type EditingItem = {
    id: string;
    quantity: number;
    price: number | string;
};

type Props = {
    orderId: string;
    editing: EditingItem | null;
    onClose: () => void;
};

export default function EditItemDialog({ orderId, editing, onClose }: Props) {
    const updForm = useForm<{ quantity: number; price: number }>({
        quantity: 1,
        price: 0,
    });

    useEffect(() => {
        if (editing) {
            updForm.setData({
                quantity: Number(editing.quantity || 1),
                price: Number(editing.price || 0),
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editing?.id]);

    return (
        <Dialog open={!!editing} onOpenChange={(v) => !v && onClose()}>
            <DialogContent aria-describedby="edit-item-desc">
                <DialogHeader>
                    <DialogTitle>Edit Item</DialogTitle>
                    <p id="edit-item-desc" className="text-sm text-muted-foreground">
                        Ubah jumlah atau harga item ini lalu simpan.
                    </p>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <Label>Qty</Label>
                        <Input
                            type="number"
                            min={1}
                            value={updForm.data.quantity}
                            onChange={(e) => updForm.setData('quantity', Number(e.target.value || 1))}
                        />
                    </div>
                    <div>
                        <Label>Harga</Label>
                        <PriceInputRupiah value={updForm.data.price} onValueChange={(num) => updForm.setData('price', num)} />
                        <div className="mt-1 text-xs text-muted-foreground">{`= ${formatRupiah(updForm.data.price)}`}</div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={() => {
                            if (!editing) return;
                            updForm.put(route('admin.orders.items.update', { order: orderId, orderItem: editing.id }), {
                                preserveScroll: true,
                                onSuccess: () => onClose(),
                            });
                        }}
                        disabled={updForm.processing}
                    >
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
