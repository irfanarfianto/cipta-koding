import { Input } from '@/components/ui/input';
import { formatRupiahInput, parseRupiah } from '@/utils/formatCurrency';
import { useEffect, useState } from 'react';

type Props = {
    value?: number | string; // angka mentah saat masuk
    onValueChange?: (num: number) => void; // kirim angka mentah keluar
    placeholder?: string;
    id?: string;
    className?: string;
};

export default function PriceInputRupiah({ value, onValueChange, placeholder = '0', id, className }: Props) {
    const [text, setText] = useState<string>('');

    useEffect(() => {
        const n = typeof value === 'string' ? Number(value) : Number(value ?? 0);
        setText(formatRupiahInput(isNaN(n) ? '' : n));
    }, [value]);

    return (
        <Input
            id={id}
            className={className}
            type="text"
            inputMode="numeric"
            placeholder={placeholder}
            value={text}
            onChange={(e) => {
                const next = formatRupiahInput(e.target.value);
                setText(next);
                onValueChange?.(parseRupiah(next));
            }}
        />
    );
}
