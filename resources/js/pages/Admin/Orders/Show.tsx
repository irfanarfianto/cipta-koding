import React from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from '@/components/ui/badge';

interface Props {
    order: any;
    paid: number;
    due: number;
    statuses: string[];
    users: any[];
}

export default function OrderShow({ order, paid, due, statuses, users }: Props) {
    const { data, setData, patch, processing } = useForm({
        status: order.status,
        note: '',
    });

    const handleStatusUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('admin.orders.update-status', order.id), {
            preserveScroll: true,
        });
    };

    return (
        <AdminLayout>
            <Head title={`Order ${order.order_code}`} />

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('admin.orders.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Order #{order.order_code}</h1>
                        <p className="text-sm text-muted-foreground">
                            Created on {format(new Date(order.created_at), 'PPP')}
                        </p>
                    </div>
                </div>
                <div className="flex space-x-3">
                    <Button variant="outline" asChild>
                        <Link href={route('admin.orders.edit', order.id)}>
                            Edit Order
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="space-y-6 lg:col-span-2">
                    {/* Order Items */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ul className="divide-y">
                                {order.items.map((item: any) => (
                                    <li key={item.id} className="flex items-center justify-between p-6">
                                        <div>
                                            <p className="font-medium text-primary">{item.item?.name || 'Unknown Item'}</p>
                                            <p className="text-sm text-muted-foreground">{item.item_type}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">
                                                Rp {Number(item.price).toLocaleString()} x {item.quantity}
                                            </p>
                                            <p className="font-bold">
                                                Rp {Number(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                            <div className="bg-muted/50 p-6 flex justify-between items-center border-t">
                                <span className="font-medium">Total Amount</span>
                                <span className="text-lg font-bold">Rp {Number(order.final_amount).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Invoices & Payments */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Invoices & Payments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
                                <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-800">Paid Amount</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-900">Rp {paid.toLocaleString()}</p>
                                </div>
                                <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <XCircle className="w-4 h-4 text-red-600" />
                                        <span className="text-sm font-medium text-red-800">Due Amount</span>
                                    </div>
                                    <p className="text-2xl font-bold text-red-900">Rp {due.toLocaleString()}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-medium mb-4">Invoices</h4>
                                <ul className="divide-y border rounded-md">
                                    {order.invoices.map((invoice: any) => (
                                        <li key={invoice.id} className="p-4 flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{invoice.invoice_code}</p>
                                                <p className="text-xs text-muted-foreground">Due: {invoice.due_date}</p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                                                    {invoice.status}
                                                </Badge>
                                                <span className="font-medium">Rp {Number(invoice.amount).toLocaleString()}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Client Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Client Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                    {order.client.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-medium">{order.client.name}</p>
                                    <p className="text-sm text-muted-foreground">{order.client.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <p>{order.client.phone_number}</p>
                                <p>{order.client.company_name}</p>
                            </div>
                            <Button variant="link" className="px-0 mt-2" asChild>
                                <Link href={route('admin.clients.show', order.client.id)}>
                                    View Client Profile &rarr;
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Team Assignment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Assignment</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Assigned Developer</label>
                                    <Select 
                                        value={order.assigned_to || ''} 
                                        onValueChange={(val) => {
                                            router.patch(route('admin.orders.assign', order.id), {
                                                assigned_to: val === 'unassigned' ? null : val
                                            }, {
                                                preserveScroll: true,
                                            });
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Developer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">Unassigned</SelectItem>
                                            {users.map((u) => (
                                                <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {order.assigned_to && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        <span>Currently assigned to <strong>{order.assignee?.name}</strong></span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Update Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleStatusUpdate} className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select 
                                        value={data.status} 
                                        onValueChange={(val) => setData('status', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {statuses.map((s) => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Note (Optional)</label>
                                    <textarea
                                        rows={3}
                                        value={data.note}
                                        onChange={(e) => setData('note', e.target.value)}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Add a note..."
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Status'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Timeline */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pl-4 border-l space-y-6">
                                {order.status_histories?.map((history: any) => (
                                    <div key={history.id} className="relative">
                                        <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm font-medium">
                                                Changed to {history.status}
                                            </p>
                                            {history.note && (
                                                <p className="text-xs text-muted-foreground italic">"{history.note}"</p>
                                            )}
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(history.created_at), 'MMM d, HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
