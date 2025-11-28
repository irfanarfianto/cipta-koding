import { Badge } from '@/components/ui/badge';

export default function OrderStatusBadge({ status }: { readonly status: string }) {
    const map: Record<string, string> = {
        'Menunggu Konfirmasi': 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
        'Menunggu Pembayaran': 'bg-orange-500/15 text-orange-700 dark:text-orange-300',
        'Sedang Dikerjakan': 'bg-blue-500/15 text-blue-700 dark:text-blue-300',
        Review: 'bg-purple-500/15 text-purple-700 dark:text-purple-300',
        Selesai: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300',
        Dibatalkan: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    };
    return <Badge className={map[status] ?? ''}>{status}</Badge>;
}
