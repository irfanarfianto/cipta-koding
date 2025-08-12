import { Card } from '@/components/ui/card';

export type History = {
    id: string;
    from_status?: string | null;
    to_status: string;
    note?: string | null;
    created_at: string;
    changer?: { id: string; name: string };
};

export default function OrderTimeline({ histories = [] }: { readonly histories: ReadonlyArray<History> }) {
    return (
        <Card className="mb-4 space-y-3 p-4">
            <div className="font-semibold">Timeline</div>
            <div className="space-y-3">
                {histories.map((h) => (
                    <div key={h.id} className="text-sm">
                        <div className="font-medium">
                            {h.from_status ?? '—'} → <span className="underline">{h.to_status}</span>
                        </div>
                        {h.note && <div className="text-muted-foreground">{h.note}</div>}
                        <div className="text-xs text-muted-foreground">
                            {new Date(h.created_at).toLocaleString('id-ID')} • {h.changer?.name ?? 'System'}
                        </div>
                    </div>
                ))}
                {histories.length === 0 && <div className="text-sm text-muted-foreground">Belum ada histori.</div>}
            </div>
        </Card>
    );
}
