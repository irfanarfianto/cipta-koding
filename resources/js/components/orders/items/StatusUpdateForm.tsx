import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';

export default function StatusUpdateForm({
    currentStatus,
    statuses,
    patchUrl,
    onSuccess,
}: {
    readonly currentStatus: string;
    readonly statuses: readonly string[];
    readonly patchUrl: string; // route('admin.orders.update-status', id)
    readonly onSuccess?: () => void; // opsional: callback setelah sukses
}) {
    const form = useForm<{ status: string; note?: string }>({
        status: currentStatus ?? statuses[0] ?? '',
        note: '',
    });

    const unchanged = form.data.status === currentStatus;

    const submit = () =>
        form.patch(patchUrl, {
            preserveScroll: true,
            onSuccess: () => {
                // kosongkan catatan setelah berhasil
                form.setData('note', '');
                onSuccess?.();
            },
        });

    return (
        <Card className="space-y-4 p-4">
            <div className="font-semibold">Ubah Status</div>

            <div className="flex flex-col gap-2">
                <Label className="text-xs sm:text-sm">Status</Label>
                <Select value={form.data.status} onValueChange={(v) => form.setData('status', v)}>
                    <SelectTrigger className="w-full md:w-56">
                        <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map((s) => (
                            <SelectItem value={s} key={s}>
                                {s}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {form.errors.status && <p className="text-xs text-destructive">{form.errors.status}</p>}
            </div>


            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Button onClick={submit} disabled={form.processing || unchanged} className="w-full sm:w-auto">
                    {form.processing ? 'Menyimpan…' : 'Simpan Status'}
                </Button>

                {unchanged && <span className="text-xs text-muted-foreground">Status belum berubah.</span>}
            </div>
        </Card>
    );
}
