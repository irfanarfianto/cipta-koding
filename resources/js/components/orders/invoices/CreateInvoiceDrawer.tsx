import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Sheet, SheetClose, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { formatRupiah, formatRupiahInput, parseRupiah } from '@/utils/formatCurrency';
import { router, useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

type Props = {
    readonly finalAmount: number;
    readonly paid: number;
    readonly due: number;
    readonly dpUrl: string;
    readonly pelunasanUrl: string;
};

export default function CreateInvoiceSheet({ finalAmount, paid, due, dpUrl, pelunasanUrl }: Props) {
    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState<'dp' | 'pelunasan'>('dp');
    const [dateObj, setDateObj] = useState<Date>(() => {
        const d = new Date();
        d.setDate(d.getDate() + 7);
        return d;
    });
    const form = useForm<{
        type: 'dp' | 'pelunasan';
        amount?: number | null;
        percent?: number | null;
        due_date: string;
    }>({
        type: mode, // default sesuai mode awal
        amount: null,
        percent: 50,
        due_date: format(dateObj, 'yyyy-MM-dd'),
    });

    const onPickDate = (d?: Date) => {
        if (!d) return;
        setDateObj(d);
        form.setData('due_date', format(d, 'yyyy-MM-dd'));
    };

    const computedAmount = useMemo(() => {
        if (mode === 'dp') {
            if (form.data.amount && form.data.amount > 0) return Math.min(form.data.amount, Math.max(0, finalAmount));
            const pct = Math.min(100, Math.max(1, Number(form.data.percent ?? 50)));
            return Math.round((finalAmount * pct) / 100);
        }
        if (form.data.amount && form.data.amount > 0) return Math.min(form.data.amount, Math.max(0, due));
        return Math.max(0, due);
    }, [mode, form.data.amount, form.data.percent, finalAmount, due]);

    const submitting = form.processing;

    const submit = () => {
        if (!form.data.due_date) return;

        if (mode === 'dp') {
            form.setData({
                type: 'dp',
                amount: form.data.amount ?? null,
                percent: form.data.amount ? null : Math.min(100, Math.max(1, Number(form.data.percent ?? 50))),
                due_date: form.data.due_date,
            });
            form.post(dpUrl, {
                preserveScroll: true,
                onSuccess: () => {
                    setOpen(false);
                    // ⬇️ segarkan data order agar list invoice muncul yang baru
                    router.reload({ only: ['order', 'paid', 'due'] });
                },
            });
            return;
        }

        form.setData({
            type: 'pelunasan',
            amount: null,
            due_date: form.data.due_date,
        });
        form.post(pelunasanUrl, {
            preserveScroll: true,
            onSuccess: () => {
                setOpen(false);
                router.reload({ only: ['order', 'paid', 'due'] });
            },
        });
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="default">Buat Invoice</Button>
            </SheetTrigger>

            {/* side bisa diubah: "right" | "left" | "top" | "bottom" */}
            <SheetContent className="w-full overflow-y-auto sm:max-w-lg" side="right" aria-describedby={undefined}>
                <SheetHeader>
                    <SheetTitle>Buat Invoice</SheetTitle>
                </SheetHeader>

                <div className="space-y-4 p-4">
                    {/* Mode */}
                    <div className="space-y-2">
                        <Label className="text-xs sm:text-sm">Jenis Invoice</Label>
                        <RadioGroup className="grid grid-cols-2 gap-2" value={mode} onValueChange={(v: 'dp' | 'pelunasan') => setMode(v)}>
                            <label className="flex items-center gap-2 rounded-md border p-2">
                                <RadioGroupItem value="dp" id="mode-dp" />
                                <span>DP</span>
                            </label>
                            <label className="flex items-center gap-2 rounded-md border p-2">
                                <RadioGroupItem value="pelunasan" id="mode-pls" />
                                <span>Pelunasan</span>
                            </label>
                        </RadioGroup>
                    </div>

                    {/* Amount / Percent */}
                    {mode === 'dp' ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label className="text-xs sm:text-sm">Nominal (opsional)</Label>
                                <Input
                                    inputMode="numeric"
                                    value={formatRupiahInput(form.data.amount ?? '')}
                                    onChange={(e) => {
                                        const val = parseRupiah(e.target.value);
                                        form.setData('amount', val || null);
                                    }}
                                    placeholder="cth: 1.000.000"
                                />
                                <p className="text-xs text-muted-foreground">Kosongkan untuk pakai persentase.</p>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs sm:text-sm">Persen DP</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={form.data.percent ?? 50}
                                    onChange={(e) => form.setData('percent', Math.min(100, Math.max(1, Number(e.target.value))))}
                                    disabled={!!form.data.amount}
                                    placeholder="50"
                                />
                                <p className="text-xs text-muted-foreground">Aktif jika nominal kosong.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <Label className="text-xs sm:text-sm">Nominal (opsional)</Label>
                            <Input
                                inputMode="numeric"
                                value={formatRupiahInput(form.data.amount ?? '')}
                                onChange={(e) => {
                                    const val = parseRupiah(e.target.value);
                                    form.setData('amount', val || null);
                                }}
                                placeholder="kosongkan untuk sisa penuh"
                            />
                            <p className="text-xs text-muted-foreground">Kosongkan untuk menagih sisa {formatRupiah(due)}.</p>
                        </div>
                    )}

                    {/* Due date */}
                    <div className="space-y-2">
                        <Label className="text-xs sm:text-sm">Jatuh Tempo</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {form.data.due_date || 'Pilih tanggal'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={dateObj} onSelect={onPickDate} autoFocus />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Preview */}
                    <div className="rounded-md border p-3 text-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Final Amount</span>
                            <span className="tabular-nums">{formatRupiah(finalAmount)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Sudah Dibayar</span>
                            <span className="tabular-nums">{formatRupiah(paid)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Sisa</span>
                            <span className="tabular-nums">{formatRupiah(due)}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between font-medium">
                            <span>Ditagihkan</span>
                            <span className="tabular-nums">{formatRupiah(computedAmount)}</span>
                        </div>
                    </div>
                </div>

                <SheetFooter className="px-4 pb-4">
                    <Button onClick={submit} disabled={submitting || !form.data.due_date}>
                        {submitting ? 'Membuat...' : 'Buat Invoice'}
                    </Button>
                    <SheetClose asChild>
                        <Button variant="outline">Batal</Button>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
