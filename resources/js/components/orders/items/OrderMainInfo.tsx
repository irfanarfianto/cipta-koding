// resources/js/components/orders/items/OrderMainInfo.tsx
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRupiah, formatRupiahInput, parseRupiah } from '@/utils/formatCurrency';
import { useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

type ClientLite = { name?: string; email?: string } | undefined | null;

export default function OrderMainInfo({
    orderId,
    client,
    notes,
    initialFinalAmount,
}: {
    readonly orderId: string;
    readonly client: ClientLite;
    readonly notes?: string | null;
    readonly initialFinalAmount: number | string | null | undefined;
}) {
    const form = useForm<{ final_amount: number | string | null }>({
        final_amount: initialFinalAmount ?? 0,
    });

    // --- Clamp & dialog state for notes ---
    const [open, setOpen] = useState(false);
    const [isClamped, setIsClamped] = useState(false);
    const clampRef = useRef<HTMLParagraphElement | null>(null);

    useEffect(() => {
        const el = clampRef.current;
        if (!el) return;
        // cek apakah konten lebih tinggi dari area clamp (terpotong)
        setIsClamped(el.scrollHeight > el.clientHeight + 1);
    }, [notes]);

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {/* Klien */}
            <div className="flex flex-col gap-2">
                <Label className="text-xs sm:text-sm">Klien</Label>
                <div className="mt-1">
                    <div className="font-medium">{client?.name ?? '-'}</div>
                    <div className="text-xs break-all text-muted-foreground">{client?.email ?? ''}</div>
                </div>
            </div>

            {/* Final Amount */}
            <div className="flex flex-col gap-2">
                <Label className="text-xs sm:text-sm">Final Amount</Label>
                <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <Input
                        type="text"
                        inputMode="numeric"
                        value={formatRupiahInput(form.data.final_amount ?? '')}
                        onChange={(e) => {
                            const raw = parseRupiah(e.target.value);
                            form.setData('final_amount', raw);
                        }}
                        className="w-full sm:w-48"
                    />
                    <Button
                        onClick={() => form.put(route('admin.orders.update', orderId), { preserveScroll: true })}
                        disabled={form.processing}
                        className="w-full sm:w-auto"
                    >
                        Simpan

                        
                    </Button>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">{formatRupiah(form.data.final_amount ?? '')}</div>
            </div>

            {/* Catatan (full width, clamp 3 baris + dialog) */}
            <div className="sm:col-span-2">
                <Label className="text-xs sm:text-sm">Catatan</Label>

                <div className="relative mt-2 rounded-md border bg-muted/40 p-3 text-sm text-muted-foreground">
                    <p
                        ref={clampRef}
                        className="[display:-webkit-box] overflow-hidden whitespace-pre-wrap [-webkit-box-orient:vertical] [-webkit-line-clamp:5]"
                    >
                        {notes?.trim() ? notes : '— Tidak ada catatan dari klien —'}
                    </p>

                    {/* gradient kecil di bawah supaya transisi potongan halus */}
                    {notes?.trim() && isClamped && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-muted/40 to-transparent" />
                    )}

                    {notes?.trim() && isClamped && (
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <button type="button" className="absolute right-2 bottom-1 z-10 text-xs font-medium text-primary underline">
                                    Baca selengkapnya
                                </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Catatan</DialogTitle>
                                </DialogHeader>
                                <div className="max-h-[60vh] overflow-auto text-sm whitespace-pre-wrap text-muted-foreground">{notes}</div>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>
        </div>
    );
}
