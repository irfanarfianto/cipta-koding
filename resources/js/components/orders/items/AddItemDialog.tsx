import PriceInputRupiah from '@/components/shared/PriceInputRupiah';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRupiah } from '@/utils/formatCurrency';
import { useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import ServiceCombobox, { type ServiceLite } from './ServiceCombobox';

type Props = {
    orderId: string;
    services: readonly ServiceLite[];
};

export default function AddItemDialog({ orderId, services }: Props) {
    const [open, setOpen] = useState(false);
    const addForm = useForm<{ service_id: string; quantity: number; price?: number }>({
        service_id: '',
        quantity: 1,
        price: undefined,
    });

    const serviceMap = useMemo(() => {
        const m = new Map<string, ServiceLite>();
        services.forEach((s) => m.set(s.id, s));
        return m;
    }, [services]);

    // removed unused variable 'selected'

    function handleSelectService(id: string) {
        addForm.setData('service_id', id);
        // seed harga dari base_price (jika ada)
        const base = serviceMap.get(id)?.base_price;
        const baseNum = base == null ? 0 : Number(base);
        addForm.setData('price', baseNum);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) addForm.reset();
            }}
        >
            <DialogTrigger asChild>
                <Button size="sm">Tambah Item</Button>
            </DialogTrigger>

            <DialogContent aria-describedby="add-item-desc">
                <DialogHeader>
                    <DialogTitle>Tambah Item</DialogTitle>
                    <p id="add-item-desc" className="text-sm text-muted-foreground">
                        Pilih service dan masukkan jumlah serta harga untuk ditambahkan ke order.
                    </p>
                </DialogHeader>

                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label>Service</Label>
                        <ServiceCombobox services={services} value={addForm.data.service_id} onSelect={handleSelectService} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label>Qty</Label>
                            <Input
                                type="number"
                                min={1}
                                value={addForm.data.quantity}
                                onChange={(e) => addForm.setData('quantity', Number(e.target.value || 1))}
                            />
                        </div>
                        <div>
                            <Label>Harga</Label>
                            <PriceInputRupiah value={addForm.data.price ?? 0} onValueChange={(num) => addForm.setData('price', num)} />
                            <div className="mt-1 text-xs text-muted-foreground">
                                {addForm.data.price != null ? `= ${formatRupiah(addForm.data.price)}` : '—'}
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={() =>
                            addForm.post(route('admin.orders.items.add', orderId), {
                                preserveScroll: true,
                                onSuccess: () => {
                                    addForm.reset();
                                    setOpen(false);
                                },
                            })
                        }
                        disabled={addForm.processing || !addForm.data.service_id}
                    >
                        Simpan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
