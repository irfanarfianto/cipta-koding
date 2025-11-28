import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { CalendarIcon, Filter as FilterIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Label } from '../ui/label';

type ClientLite = { id: string; name: string };

type FiltersValue = {
    status?: string | null;
    client_id?: string | null;
    date_from?: string | null;
    date_to?: string | null;
    search?: string | null;
    sort?: string | null;
    per_page?: number | null;
};

export default function OrderFilters({
    statuses,
    clients,
    value,
    onChange,
}: {
    readonly statuses: readonly string[];
    readonly clients: readonly ClientLite[];
    readonly value: Readonly<FiltersValue>;
    readonly onChange: (next: FiltersValue) => void;
}) {
    const [open, setOpen] = useState(false);

    // pakai string agar controlled & kompatibel backend
    const [form, setForm] = useState({
        status: value.status && value.status !== '' ? value.status : 'all',
        client_id: value.client_id && value.client_id !== '' ? value.client_id : 'all',
        date_from: value.date_from ?? '',
        date_to: value.date_to ?? '',
        search: value.search ?? '',
        sort: value.sort ?? '',
        per_page: String(value.per_page ?? 10),
    });

    // sinkronisasi jika value dari server berubah
    useEffect(() => {
        setForm((f) => ({
            ...f,
            status: value.status && value.status !== '' ? value.status : 'all',
            client_id: value.client_id && value.client_id !== '' ? value.client_id : 'all',
            date_from: value.date_from ?? '',
            date_to: value.date_to ?? '',
            search: value.search ?? '',
            sort: value.sort ?? '',
            per_page: String(value.per_page ?? 10),
        }));
    }, [value]);

    const apply = () => {
        onChange({
            status: form.status === 'all' ? '' : form.status,
            client_id: form.client_id === 'all' ? '' : form.client_id,
            date_from: form.date_from || '',
            date_to: form.date_to || '',
            search: form.search || '',
            sort: form.sort || '',
            per_page: Number(form.per_page || 10),
        });
        setOpen(false);
    };

    const reset = () => {
        const cleared = {
            status: '',
            client_id: '',
            date_from: '',
            date_to: '',
            search: '',
            sort: '',
            per_page: 10,
        };

        setForm({
            status: 'all',
            client_id: 'all',
            date_from: '',
            date_to: '',
            search: '',
            sort: '',
            per_page: '10',
        });

        onChange(cleared);
        setOpen(false);
    };

    // hitung jumlah filter aktif untuk badge tombol
    const activeCount = useMemo(() => {
        let c = 0;
        if (form.status !== 'all') c++;
        if (form.client_id !== 'all') c++;
        if (form.date_from) c++;
        if (form.date_to) c++;
        if (form.search) c++;
        if (form.sort) c++;
        return c;
    }, [form]);

    return (
        <div>
            {/* Toolbar ringkas: tombol Filter (dengan badge jumlah aktif) */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <FilterIcon className="mr-2 h-4 w-4" />
                        Filter
                        {activeCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {activeCount}
                            </Badge>
                        )}
                    </Button>
                </DialogTrigger>

                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Filter Orders</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-3 sm:grid-cols-2">
                        {/* Status */}
                        <div className="sm:col-span-1">
                            <Label className="mb-1 block text-sm text-muted-foreground">Status</Label>
                            <Select value={form.status} onValueChange={(v) => setForm((s) => ({ ...s, status: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    {statuses.map((s) => (
                                        <SelectItem key={s} value={s}>
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Client */}
                        <div className="sm:col-span-1">
                            <Label className="mb-1 block text-sm text-muted-foreground">Klien</Label>
                            <Select value={form.client_id} onValueChange={(v) => setForm((s) => ({ ...s, client_id: v }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Klien" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Klien</SelectItem>
                                    {clients.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date From */}
                        <div className="sm:col-span-1">
                            <Label className="mb-1 block text-sm text-muted-foreground">Tanggal Mulai</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.date_from ? format(new Date(form.date_from), 'yyyy-MM-dd') : <span>Pilih tanggal mulai</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={form.date_from ? new Date(form.date_from) : undefined}
                                        onSelect={(d: Date | undefined) => setForm((s) => ({ ...s, date_from: d ? format(d, 'yyyy-MM-dd') : '' }))}
                                        autoFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Date To */}
                        <div className="sm:col-span-1">
                            <Label className="mb-1 block text-sm text-muted-foreground">Tanggal Akhir</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {form.date_to ? format(new Date(form.date_to), 'yyyy-MM-dd') : <span>Pilih tanggal akhir</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={form.date_to ? new Date(form.date_to) : undefined}
                                        onSelect={(d: Date | undefined) => setForm((s) => ({ ...s, date_to: d ? format(d, 'yyyy-MM-dd') : '' }))}
                                        autoFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Search */}
                        <div className="sm:col-span-2">
                            <Label className="mb-1 block text-sm text-muted-foreground">Pencarian</Label>
                            <Input
                                placeholder="Cari kode/nama/email…"
                                value={form.search}
                                onChange={(e) => setForm((s) => ({ ...s, search: e.target.value ?? '' }))}
                            />
                        </div>
                    </div>

                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={reset}>
                            Reset
                        </Button>
                        <Button onClick={apply}>Terapkan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
