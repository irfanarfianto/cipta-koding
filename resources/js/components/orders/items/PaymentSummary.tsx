import { Card } from '@/components/ui/card';

export default function PaymentSummary({
    finalAmount,
    paid,
    due,
    formatRupiah,
}: {
    readonly finalAmount: number | string | null | undefined;
    readonly paid: number | string;
    readonly due: number | string;
    readonly formatRupiah: (v: number | string | null | undefined) => string;
}) {
    return (
        <Card className="space-y-3 p-4">
                <div className="font-semibold">Ringkasan Pembayaran</div>
                <div className="flex items-center flex-col sm:flex-row items-start md:justify-between text-sm">
                <span>Final Amount</span>
                <span>{formatRupiah(finalAmount ?? 0)}</span>
            </div>
            <div className="flex items-center flex-col sm:flex-row items-start md:justify-between text-sm">
                <span>Sudah Dibayar</span>
                <span>{formatRupiah(paid)}</span>
            </div>
            <div className="flex items-center flex-col sm:flex-row items-start md:justify-between text-sm">
                <span>Sisa</span>
                <span className="font-semibold">{formatRupiah(due)}</span>
            </div>
        </Card>
    );
}
