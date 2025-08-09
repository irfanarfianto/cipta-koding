// utils/formatCurrency.ts

/**
 * Format angka ke format Rupiah (hanya ribuan, tanpa desimal)
 * Contoh: 4000000 -> "4.000.000"
 */
export function formatRupiahInput(value: string | number): string {
    if (value === null || value === undefined) return '';
    const raw = String(value);
    const cleaned = raw.replace(/[^0-9,]/g, ''); // sisakan angka & koma
    const [intPart = '', decPart] = cleaned.split(','); // jangan potong koma pengguna
    const intNum = intPart === '' ? '' : Number(intPart).toLocaleString('id-ID');
    return decPart !== undefined ? `${intNum},${decPart}` : intNum;
}

export function parseRupiah(value: string): number {
    if (!value) return 0;
    const cleaned = value.replace(/\./g, '').replace(',', '.'); // ribuan → hilang, desimal → titik
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
}

export function formatRupiah(value: number | string | null | undefined): string {
    const n = typeof value === 'string' ? parseFloat(value || '0') : Number(value || 0);
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}