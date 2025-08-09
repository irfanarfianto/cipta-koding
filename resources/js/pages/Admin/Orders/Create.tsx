import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';

type ClientLite = { id: string; name: string; email?: string | null };
type ServiceLite = { id: string; name: string; base_price?: number | string | null };

type NewItem = { service_id: string; quantity: number; /* price optional di admin mode */ price?: number | string };

type PageProps = {
    clients: ClientLite[];
    services: ServiceLite[];
    defaults?: {
        client_id?: string | null;
        notes?: string | null;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Orders', href: '/admin/orders' },
    { title: 'Create', href: '/admin/orders/create' },
];

function formatCurrency(n: number | string) {
    const v = typeof n === 'string' ? parseFloat(n || '0') : n;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v || 0);
}

export default function Create(props: Readonly<PageProps>) {
    const { clients, services, defaults } = props;

    // === MODE =====
    // TRUE = form untuk KLIEN (tanpa input harga, hanya tampil "Mulai dari ...")
    // FALSE = form untuk ADMIN (bisa atur harga & total)
    const clientMode = true;

    // maps
    const clientMap = useMemo(() => new Map(clients.map((c) => [c.id, c])), [clients]);
    const serviceMap = useMemo(() => new Map(services.map((s) => [s.id, s])), [services]);

    // ---- Form state ----
    const [items, setItems] = useState<NewItem[]>([]);
    const [useSubtotalAsFinal, setUseSubtotalAsFinal] = useState(!clientMode); // di client mode -> selalu false

    const form = useForm<{
        client_id: string;
        order_code?: string;
        notes: string;
        final_amount?: number | string | null;
        items: NewItem[];
    }>({
        client_id: defaults?.client_id ?? '',
        order_code: '',
        notes: defaults?.notes ?? '',
        final_amount: '',
        items: [],
    });

    // SUBTOTAL (admin mode saja yang make sense)
    const subtotal = useMemo(
        () => (clientMode ? 0 : items.reduce((acc, it) => acc + Number(it.quantity || 0) * Number(it.price || 0), 0)),
        [items, clientMode],
    );

    const finalAmountDisplay = useMemo(() => {
        if (clientMode) return 0;
        if (useSubtotalAsFinal) return subtotal;
        const v = form.data.final_amount;
        return typeof v === 'string' ? parseFloat(v || '0') : Number(v || 0);
    }, [clientMode, useSubtotalAsFinal, subtotal, form.data.final_amount]);

    // ---- Client combobox ----
    const selectedClient = form.data.client_id ? clientMap.get(form.data.client_id) : undefined;

    // ---- Add Item dialog ----
    const [openAdd, setOpenAdd] = useState(false);
    const addItemForm = useForm<NewItem>({
        service_id: '',
        quantity: 1,
        // price hanya dipakai saat admin mode
        ...(clientMode ? {} : { price: '' }),
    });

    const selectedService = addItemForm.data.service_id ? serviceMap.get(addItemForm.data.service_id) : undefined;

    function selectServiceForAdd(id: string) {
        addItemForm.setData('service_id', id);
        if (!clientMode) {
            // admin mode: auto isi price dari base_price kalau kosong
            const price = addItemForm.data.price;
            if (price === '' || price === undefined || price === null) {
                const base = serviceMap.get(id)?.base_price ?? '';
                addItemForm.setData('price', base === null ? '' : String(base));
            }
        }
    }

    function pushItem() {
        if (!addItemForm.data.service_id) return;
        const payload: NewItem = {
            service_id: addItemForm.data.service_id,
            quantity: Number(addItemForm.data.quantity || 1),
            ...(clientMode
                ? {}
                : {
                      price: addItemForm.data.price === '' ? 0 : Number(addItemForm.data.price),
                  }),
        };
        setItems((prev) => [...prev, payload]);
        addItemForm.reset();
        setOpenAdd(false);
    }

    function updateItemAt(idx: number, patch: Partial<NewItem>) {
        setItems((prev) => prev.map((row, i) => (i === idx ? { ...row, ...patch } : row)));
    }

    function removeItemAt(idx: number) {
        setItems((prev) => prev.filter((_, i) => i !== idx));
    }

    function submit() {
        const payloadItems = items.map((it) => ({
            service_id: it.service_id,
            quantity: Number(it.quantity || 1),
            ...(typeof it.price !== 'undefined' ? { price: Number(it.price || 0) } : {}),
        }));

        const payload = {
            client_id: form.data.client_id,
            order_code: form.data.order_code || null,
            notes: form.data.notes || null,
            // jika admin-mode:
            // final_amount: useSubtotalAsFinal ? subtotal : (form.data.final_amount ?? null),
            // jika client-mode:
            final_amount: null,
            items: payloadItems,
        };

        router.post(route('admin.orders.store'), payload, {
            preserveScroll: true,
        });
    }



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Order" />

            <div className="m-4 flex items-center justify-between gap-3">
                <div className="text-xl font-semibold">Buat Order</div>
                <div className="flex gap-2">
                    <Link href={route('admin.orders.index')}>
                        <Button variant="outline">Batal</Button>
                    </Link>
                    <Button onClick={submit} disabled={form.processing || !form.data.client_id || items.length === 0}>
                        Simpan
                    </Button>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="m-4 grid gap-4 md:grid-cols-3">
                {/* Kiri: Info Order */}
                <Card className="space-y-4 p-4 md:col-span-2">
                    {/* Client & Notes */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Klien</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className={cn('w-full justify-between', !selectedClient && 'text-muted-foreground')}
                                    >
                                        {selectedClient
                                            ? `${selectedClient.name}${selectedClient.email ? ` — ${selectedClient.email}` : ''}`
                                            : 'Pilih klien…'}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Cari klien…" />
                                        <CommandList>
                                            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                {clients.map((c) => {
                                                    const active = c.id === form.data.client_id;
                                                    return (
                                                        <CommandItem
                                                            key={c.id}
                                                            value={`${c.name} ${c.email ?? ''}`.trim()}
                                                            onSelect={() => form.setData('client_id', c.id)}
                                                            className="cursor-pointer"
                                                        >
                                                            <Check className={cn('mr-2 h-4 w-4', active ? 'opacity-100' : 'opacity-0')} />
                                                            <div className="flex w-full items-center justify-between">
                                                                <span>{c.name}</span>
                                                                {c.email && <span className="text-xs text-muted-foreground">{c.email}</span>}
                                                            </div>
                                                        </CommandItem>
                                                    );
                                                })}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                            {form.errors.client_id && <p className="text-xs text-red-500">{form.errors.client_id}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label>Kode Order (opsional)</Label>
                            <Input
                                placeholder="AUTO jika dikosongkan"
                                value={form.data.order_code ?? ''}
                                onChange={(e) => form.setData('order_code', e.target.value)}
                            />
                            {form.errors.order_code && <p className="text-xs text-red-500">{form.errors.order_code}</p>}
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                            <Label>Catatan</Label>
                            <Textarea rows={3} value={form.data.notes} onChange={(e) => form.setData('notes', e.target.value)} />
                            {form.errors.notes && <p className="text-xs text-red-500">{form.errors.notes}</p>}
                        </div>
                    </div>

                    {/* Items Builder */}
                    <div className="flex items-center justify-between">
                        <div className="font-semibold">Items</div>
                        <Dialog open={openAdd} onOpenChange={setOpenAdd}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" /> Tambah Item
                                </Button>
                            </DialogTrigger>
                            <DialogContent aria-describedby="add-item-desc">
                                <DialogHeader>
                                    <DialogTitle>Tambah Item</DialogTitle>
                                    <p id="add-item-desc" className="text-sm text-muted-foreground">
                                        Pilih service lalu atur jumlah.
                                        {!clientMode && ' (Admin dapat mengatur harga di sini)'}
                                    </p>
                                </DialogHeader>

                                <div className="space-y-3">
                                    {/* Service combobox */}
                                    <div className="space-y-1.5">
                                        <Label>Service</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn('w-full justify-between', !selectedService && 'text-muted-foreground')}
                                                >
                                                    {selectedService ? selectedService.name : 'Pilih service…'}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Cari service…" />
                                                    <CommandList>
                                                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                                        <CommandGroup>
                                                            {services.map((s) => {
                                                                const active = s.id === addItemForm.data.service_id;
                                                                return (
                                                                    <CommandItem
                                                                        key={s.id}
                                                                        value={s.name}
                                                                        onSelect={() => selectServiceForAdd(s.id)}
                                                                        className="cursor-pointer"
                                                                    >
                                                                        <Check className={cn('mr-2 h-4 w-4', active ? 'opacity-100' : 'opacity-0')} />
                                                                        <div className="flex w-full items-center justify-between">
                                                                            <span>{s.name}</span>
                                                                            {/* Tampilkan patokan harga */}
                                                                            {s.base_price != null && (
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    Mulai dari {Number(s.base_price || 0).toLocaleString('id-ID')}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </CommandItem>
                                                                );
                                                            })}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <Label>Qty</Label>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={addItemForm.data.quantity}
                                                onChange={(e) => addItemForm.setData('quantity', Number(e.target.value || 1))}
                                            />
                                        </div>

                                        {/* Harga hanya di admin mode */}
                                        {!clientMode && (
                                            <div>
                                                <Label>Harga</Label>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={typeof addItemForm.data.price !== 'undefined' ? (addItemForm.data.price ?? '') : ''}
                                                    onChange={(e) => addItemForm.setData('price' as keyof NewItem, e.target.value)}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info untuk klien */}
                                    {clientMode && (
                                        <p className="text-xs text-muted-foreground">
                                            Harga final akan dikonfirmasi oleh admin setelah meninjau kebutuhan Anda.
                                        </p>
                                    )}
                                </div>

                                <DialogFooter>
                                    <Button onClick={pushItem} disabled={!addItemForm.data.service_id || addItemForm.processing}>
                                        Tambah
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    {!clientMode && <TableHead className="text-right">Harga</TableHead>}
                                    {!clientMode && <TableHead className="text-right">Subtotal</TableHead>}
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((it, idx) => {
                                    const svc = serviceMap.get(it.service_id);
                                    const sub = Number(it.quantity || 0) * Number(it.price || 0);
                                    return (
                                        <TableRow key={`${it.service_id}-${idx}`}>
                                            <TableCell className="max-w-[280px] truncate">{svc?.name ?? it.service_id}</TableCell>
                                            <TableCell className="text-right">
                                                <Input
                                                    className="h-8 w-24 text-right"
                                                    type="number"
                                                    min={1}
                                                    value={it.quantity}
                                                    onChange={(e) => updateItemAt(idx, { quantity: Number(e.target.value || 1) })}
                                                />
                                                {/* hint starting price di client mode */}
                                                {clientMode && svc?.base_price != null && (
                                                    <div className="mt-1 text-[11px] text-muted-foreground">
                                                        Mulai dari {Number(svc.base_price || 0).toLocaleString('id-ID')}
                                                    </div>
                                                )}
                                            </TableCell>

                                            {/* kolom harga & subtotal hanya untuk admin mode */}
                                            {!clientMode && (
                                                <>
                                                    <TableCell className="text-right">
                                                        <Input
                                                            className="h-8 w-36 text-right"
                                                            type="number"
                                                            min={0}
                                                            value={typeof it.price !== 'undefined' ? (it.price ?? '') : ''}
                                                            onChange={(e) => updateItemAt(idx, { price: e.target.value })}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right">{sub.toLocaleString('id-ID')}</TableCell>
                                                </>
                                            )}

                                            <TableCell className="text-right">
                                                <Button size="icon" variant="ghost" onClick={() => removeItemAt(idx)} aria-label="Hapus item">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {items.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={clientMode ? 3 : 5} className="py-10 text-center text-muted-foreground">
                                            Belum ada item. Klik <b>Tambah Item</b> untuk mulai.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </Card>

                {/* Kanan: Ringkasan & Submit */}
                <Card className="space-y-4 p-4">
                    <div className="font-semibold">Ringkasan</div>

                    {clientMode ? (
                        <div className="space-y-2 text-sm">
                            <p className="text-muted-foreground">
                                Anda belum melihat total harga di tahap ini. <br />
                                <b>Harga final akan dikonfirmasi oleh admin</b> setelah meninjau kebutuhan Anda.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span>Subtotal</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="useSubtotal"
                                        checked={useSubtotalAsFinal}
                                        onCheckedChange={(v) => setUseSubtotalAsFinal(Boolean(v))}
                                    />
                                    <Label htmlFor="useSubtotal">Gunakan subtotal sebagai Final Amount</Label>
                                </div>
                            </div>

                            {!useSubtotalAsFinal && (
                                <div className="space-y-1.5">
                                    <Label>Final Amount</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={form.data.final_amount ?? ''}
                                        onChange={(e) => form.setData('final_amount', e.target.value)}
                                    />
                                    {form.errors.final_amount && <p className="text-xs text-red-500">{form.errors.final_amount}</p>}
                                </div>
                            )}

                            <Separator />

                            <div className="flex items-center justify-between">
                                <span>Total</span>
                                <span className="text-base font-semibold">{formatCurrency(finalAmountDisplay)}</span>
                            </div>
                        </div>
                    )}

                    <div className="pt-2">
                        <Button className="w-full" onClick={submit} disabled={form.processing || !form.data.client_id || items.length === 0}>
                            Simpan Order
                        </Button>
                    </div>
                </Card>
            </div>
        </AppLayout>
    );
}
