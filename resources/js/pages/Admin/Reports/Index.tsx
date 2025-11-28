import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { formatRupiah } from '@/utils/formatCurrency';

export default function Index() {
    const [summary, setSummary] = useState({ revenue: 0, pending: 0, overdue: 0 });
    const [chartData, setChartData] = useState([]);
    const [range, setRange] = useState('this_year');

    useEffect(() => {
        fetch(route('admin.reports.summary', { range }))
            .then(res => res.json())
            .then(data => setSummary(data));
            
        fetch(route('admin.reports.revenue-chart'))
            .then(res => res.json())
            .then(data => setChartData(data));
    }, [range]);

    return (
        <AppLayout breadcrumbs={[{ title: 'Financial Reports', href: '/admin/reports' }]}>
            <Head title="Financial Reports" />
            
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">Financial Overview</h2>
                    <Select value={range} onValueChange={setRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="this_month">This Month</SelectItem>
                            <SelectItem value="last_month">Last Month</SelectItem>
                            <SelectItem value="this_year">This Year</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatRupiah(summary.revenue)}</div>
                            <p className="text-xs text-muted-foreground">Based on selected range</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatRupiah(summary.pending)}</div>
                            <p className="text-xs text-muted-foreground">Total outstanding amount</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Overdue Invoices</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-destructive">{formatRupiah(summary.overdue)}</div>
                            <p className="text-xs text-muted-foreground">Total overdue amount</p>
                        </CardContent>
                    </Card>
                </div>

                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Revenue Overview (This Year)</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rp${value / 1000}k`} />
                                    <Tooltip formatter={(value) => formatRupiah(value as number)} />
                                    <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
