import { TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis } from 'recharts';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type InputPoint = { ym: string; total: number }; // { ym: "YYYY-MM", total: number }
type Props = {
    readonly data: readonly InputPoint[];
    readonly months?: number; // default 12 untuk mode "12 bulan terakhir"
    readonly currencyFormatter?: (n: number | string) => string;
    readonly title?: string;
    readonly description?: string;
    readonly years?: number[]; // daftar tahun untuk filter, ex: [2023,2024,2025]
    readonly initialYear?: number | null; // default: null (pakai mode 12 bulan terakhir)
};

const chartConfig = {
    revenue: {
        label: 'Pendapatan',
        color: 'var(--chart-1)', // -> var(--color-revenue)
    },
} satisfies ChartConfig;

function toShortMon(y: number, m: number) {
    const date = new Date(y, m - 1, 1);
    return new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(date);
}
function toLabel(ym: string) {
    // "YYYY-MM" -> "Jan 25"
    const [y, m] = ym.split('-').map((v) => parseInt(v, 10));
    if (!y || !m) return ym;
    return `${toShortMon(y, m)} ${String(y).slice(2)}`;
}

export default function RevenueAreaMonthly({
    data,
    months = 12,
    currencyFormatter,
    title = 'Pendapatan Bulanan',
    description = `12 bulan terakhir`,
    years = [],
    initialYear = null,
}: Props) {
    const [year, setYear] = useState<number | null>(initialYear ?? null);

    // --------- Build series ----------
    const series = useMemo(() => {
        // Mode filter per tahun
        if (year) {
            // Ambil data yang match tahun tsb (YYYY-MM)
            const mapByMonth = new Map<number, number>(); // 1..12 -> total
            data.forEach(({ ym, total }) => {
                const [yy, mm] = ym.split('-').map((v) => parseInt(v, 10));
                if (yy === year && mm >= 1 && mm <= 12) {
                    mapByMonth.set(mm, (mapByMonth.get(mm) ?? 0) + Number(total || 0));
                }
            });
            // Isi 12 bulan, kosong = 0
            return Array.from({ length: 12 }, (_, i) => {
                const m = i + 1;
                return {
                    month: `${toShortMon(year, m)} ${String(year).slice(2)}`,
                    revenue: mapByMonth.get(m) ?? 0,
                };
            });
        }

        // Mode default: 12 bulan terakhir dari seluruh data
        const sorted = [...data].sort((a, b) => a.ym.localeCompare(b.ym));
        const sliced = sorted.slice(-months);
        return sliced.map((d) => ({
            month: toLabel(d.ym),
            revenue: d.total,
        }));
    }, [data, months, year]);

    // Trend % (bulan terakhir vs sebelumnya)
    const trend = useMemo(() => {
        if (series.length < 2) return null;
        const last = Number(series[series.length - 1].revenue) || 0;
        const prev = Number(series[series.length - 2].revenue) || 0;
        if (prev === 0) return null;
        return ((last - prev) / prev) * 100;
    }, [series]);

    const rangeLabel = useMemo(() => {
        if (year) return String(year);
        if (series.length === 0) return '';
        const first = series[0].month;
        const last = series[series.length - 1].month;
        return `${first} - ${last}`;
    }, [series, year]);

    const totalAll = useMemo(() => series.reduce((acc, cur) => acc + (Number(cur.revenue) || 0), 0), [series]);

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <CardTitle>{title}</CardTitle>
                        <CardDescription>{year ? `Tahun ${year}` : description}</CardDescription>
                    </div>

                    {/* Tahun Filter */}
                    <div className="w-36">
                        <Select value={year ? String(year) : 'all'} onValueChange={(v) => setYear(v === 'all' ? null : Number(v))}>
                            <SelectTrigger>
                                <SelectValue placeholder="Semua tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua tahun</SelectItem>
                                {years
                                    .slice() // copy
                                    .sort((a, b) => b - a) // descending
                                    .map((y) => (
                                        <SelectItem key={y} value={String(y)}>
                                            {y}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <ChartContainer config={chartConfig}>
                    <div className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={series} margin={{ left: 12, right: 12, top: 8, bottom: 8 }}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" hideLabel />} />
                                <Area
                                    dataKey="revenue"
                                    name="Pendapatan"
                                    type="linear"
                                    fill="var(--color-revenue)"
                                    fillOpacity={0.4}
                                    stroke="var(--color-revenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </ChartContainer>
            </CardContent>

            <CardFooter>
                <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-2">
                        <div className="flex items-center gap-2 leading-none font-medium">
                            {typeof trend === 'number' ? (
                                <>
                                    {trend >= 0 ? 'Trending up' : 'Trending down'} by {Math.abs(trend).toFixed(1)}% <TrendingUp className="h-4 w-4" />
                                </>
                            ) : (
                                <>—</>
                            )}
                        </div>
                        <div className="flex items-center gap-2 leading-none text-muted-foreground">{rangeLabel}</div>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">Total: {currencyFormatter ? currencyFormatter(totalAll) : totalAll}</div>
                </div>
            </CardFooter>
        </Card>
    );
}
