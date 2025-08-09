import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';

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
    // Gunakan string untuk semua state agarcontrolled
    const [form, setForm] = useState({
        status: value.status && value.status !== '' ? value.status : 'all',
        client_id: value.client_id && value.client_id !== '' ? value.client_id : 'all',
        date_from: value.date_from ?? '',
        date_to: value.date_to ?? '',
        search: value.search ?? '',
        sort: value.sort ?? '',
        per_page: String(value.per_page ?? 10),
    });

    // Sinkronisasi jika value dari server berubah
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
    };

    const reset = () => {
        setForm({
            status: 'all',
            client_id: 'all',
            date_from: '',
            date_to: '',
            search: '',
            sort: '',
            per_page: '10',
        });
        onChange({});
    };

    return (
        <div className="grid gap-3 p-4 md:grid-cols-6">
            {/* Status */}
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

            {/* Client */}
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

            {/* Date range */}
            <Input type="date" value={form.date_from} onChange={(e) => setForm((s) => ({ ...s, date_from: e.target.value ?? '' }))} />
            <Input type="date" value={form.date_to} onChange={(e) => setForm((s) => ({ ...s, date_to: e.target.value ?? '' }))} />

            {/* Search */}
            <Input
                placeholder="Cari kode/nama/email…"
                value={form.search}
                onChange={(e) => setForm((s) => ({ ...s, search: e.target.value ?? '' }))}
            />

            <div className="flex gap-2">
                <Button variant="outline" onClick={reset}>
                    Reset
                </Button>
                <Button onClick={apply}>Filter</Button>
            </div>
        </div>
    );
}
