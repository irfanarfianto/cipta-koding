'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as React from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis } from 'recharts';

type InputPoint = { ym: string; total: number }; // { ym: "YYYY-MM", total: number }

type Props = {
    data: Readonly<InputPoint[]>;
    years?: number[];
    initialYear?: number | null;
    currencyFormatter?: (n: number | string) => string;
    title?: string;
    description?: string;
    height?: number; // px
};

const chartConfig = {
    revenue: { label: 'Pendapatan', color: 'var(--chart-1)' },
} satisfies ChartConfig;

function ymToDate(ym: string) {
    const [y, m] = ym.split('-').map((v) => parseInt(v, 10));
    return new Date(y, (m || 1) - 1, 1);
}
function dateToYm(d: Date) {
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    return `${y}-${String(m).padStart(2, '0')}`;
}
function toMonthLabel(ym: string) {
    const d = ymToDate(ym);
    const mon = new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(d);
    return `${mon} ${String(d.getFullYear()).slice(2)}`;
}
function getLastNMonths(endYm: string, n = 12): string[] {
    const end = ymToDate(endYm);
    const arr: string[] = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
        arr.push(dateToYm(d));
    }
    return arr;
}

export default function RevenueBarMonthly({
    data,
    years = [],
    initialYear = null,
    currencyFormatter,
    title = 'Pendapatan Bulanan',
    description = '12 bulan terakhir',
    height = 280,
}: Readonly<Props>) {
    const [year, setYear] = React.useState<number | null>(initialYear);

    // Precompute total per YM
    const totalsByYm = React.useMemo(() => {
        const map = new Map<string, number>();
        for (const { ym, total } of data) {
            map.set(ym, (map.get(ym) ?? 0) + Number(total || 0));
        }
        return map;
    }, [data]);

    // Tentukan anchor untuk "12 bulan terakhir": pakai YM terbaru dari data, kalau kosong pakai bulan ini
    const latestYm = React.useMemo(() => {
        if (!data.length) return dateToYm(new Date());
        const sorted = [...data].map((d) => d.ym).sort((a, b) => a.localeCompare(b)); // "YYYY-MM" sortable lexicographically
        return sorted[sorted.length - 1];
    }, [data]);

    // Build data bulanan final (selalu 12 poin)
    const monthly = React.useMemo(() => {
        if (year) {
            // Mode filter tahun: selalu render Jan..Des (12 bulan)
            const ymList = Array.from({ length: 12 }, (_, i) => `${year}-${String(i + 1).padStart(2, '0')}`);
            return ymList.map((ym) => ({
                ym,
                label: toMonthLabel(ym),
                revenue: totalsByYm.get(ym) ?? 0,
            }));
        }
        // Mode 12 bulan terakhir: generate 12 YM berurutan mundur dari YM terbaru
        const ymList = getLastNMonths(latestYm, 12);
        return ymList.map((ym) => ({
            ym,
            label: toMonthLabel(ym),
            revenue: totalsByYm.get(ym) ?? 0,
        }));
    }, [year, totalsByYm, latestYm]);


    return (
        <Card className="py-0">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{year ? `Tahun ${year}` : description}</CardDescription>
                </div>
                <div className="flex items-center gap-2 px-6 pb-3 sm:px-8 sm:py-6">
                    <Select value={year ? String(year) : 'all'} onValueChange={(v) => setYear(v === 'all' ? null : Number(v))}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Semua tahun" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Semua tahun</SelectItem>
                            {years
                                .slice()
                                .sort((a, b) => b - a)
                                .map((y) => (
                                    <SelectItem key={y} value={String(y)}>
                                        {y}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </div>
            </CardHeader>

            <CardContent className="px-2 sm:p-6">
                <ChartContainer config={chartConfig} className="w-full" style={{ height }}>
                    <ResponsiveContainer width="100%" aspect={3.5}>
                        <BarChart accessibilityLayer data={monthly} margin={{ left: 12, right: 12 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} minTickGap={24} />
                            <ChartTooltip
                                content={
                                    <ChartTooltipContent
                                        className="w-[160px]"
                                        nameKey="revenue"
                                        formatter={(value: string | number | (string | number)[]) => {
                                            const val = Array.isArray(value) ? value[0] : value;
                                            return currencyFormatter ? currencyFormatter(val) : Number(val).toLocaleString('id-ID');
                                        }}
                                        labelFormatter={(_label, payload) => {
                                            const ym = (payload?.[0]?.payload as { ym?: string })?.ym;
                                            return ym ?? '';
                                        }}
                                    />
                                }
                            />
                            <Bar dataKey="revenue" name="Pendapatan" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
