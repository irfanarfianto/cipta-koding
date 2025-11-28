import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ArrowLeft, Mail, Phone, Edit, Trash2, ShoppingBag, CreditCard, TrendingUp, MessageCircle, MoreVertical, Send } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import { Textarea } from "@/Components/ui/textarea"
import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';

interface Order {
    id: string;
    order_code: string;
    status: string;
    final_amount: number;
    created_at: string;
}

interface Client {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    address: string;
    company_name: string;
    company_website: string;
    status: string;
    metadata: any;
    created_at: string;
}

interface Stats {
    total_orders: number;
    total_spent: number;
    average_order_value: number;
    segment: string;
    last_order: string | null;
}

interface Props {
    client: Client;
    orders: {
        data: Order[];
        links: any[];
    };
    stats: Stats;
}

export default function ClientShow({ client, orders, stats }: Props) {
    const { data, setData, put, processing } = useForm({
        name: client.name,
        email: client.email,
        phone_number: client.phone_number,
        address: client.address,
        company_name: client.company_name,
        company_website: client.company_website,
        status: client.status,
        metadata: client.metadata || {},
    });

    const handleSaveNotes = () => {
        put(route('admin.clients.update', client.id), {
            preserveScroll: true,
            onSuccess: () => {
                // Optional: Show toast
            }
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const getSegmentColor = (segment: string) => {
        switch (segment) {
            case 'VIP': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'New': return 'bg-blue-100 text-blue-800 border-blue-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Selesai': return 'bg-green-100 text-green-800';
            case 'Dibatalkan': return 'bg-red-100 text-red-800';
            case 'Menunggu Pembayaran': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <Head title={`Client: ${client.name}`} />

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href={route('admin.clients.index')}>
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
                            <Badge variant="outline" className={getSegmentColor(stats.segment)}>
                                {stats.segment}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {client.email}
                            </div>
                            {client.phone_number && (
                                <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    {client.phone_number}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" asChild>
                        <a href={`mailto:${client.email}`}>
                            <Mail className="mr-2 h-4 w-4" /> Email
                        </a>
                    </Button>
                    {client.phone_number && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="text-green-600 border-green-200 hover:bg-green-50">
                                    <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Send Message</DropdownMenuLabel>
                                <DropdownMenuItem asChild>
                                    <a 
                                        href={`https://wa.me/${client.phone_number.replace(/\D/g, '')}`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                    >
                                        Direct Chat
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem asChild>
                                    <a 
                                        href={`https://wa.me/${client.phone_number.replace(/\D/g, '')}?text=Halo ${client.name}, terima kasih telah menjadi pelanggan setia kami.`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                    >
                                        Greeting
                                    </a>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <a 
                                        href={`https://wa.me/${client.phone_number.replace(/\D/g, '')}?text=Halo ${client.name}, kami ingin menginformasikan promo terbaru.`} 
                                        target="_blank" 
                                        rel="noreferrer"
                                    >
                                        Promo Info
                                    </a>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                    <Button variant="outline" asChild>
                        <Link href={route('admin.clients.edit', client.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Edit
                        </Link>
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.total_spent)}</div>
                        <p className="text-xs text-muted-foreground">
                            Lifetime value
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total_orders}</div>
                        <p className="text-xs text-muted-foreground">
                            Completed & Active
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(stats.average_order_value)}</div>
                        <p className="text-xs text-muted-foreground">
                            Per transaction
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="orders" className="w-full">
                <TabsList>
                    <TabsTrigger value="orders">Order History</TabsTrigger>
                    <TabsTrigger value="details">Client Details</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                </TabsList>
                
                <TabsContent value="orders" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>
                                Recent orders placed by this client.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order Code</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.data.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No orders found.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        orders.data.map((order) => (
                                            <TableRow key={order.id}>
                                                <TableCell className="font-medium">{order.order_code}</TableCell>
                                                <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy')}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getStatusColor(order.status)}>
                                                        {order.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {formatCurrency(order.final_amount)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" asChild>
                                                        <Link href={route('admin.orders.show', order.id)}>
                                                            View
                                                        </Link>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="details" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                                    <p className="text-base">{client.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                                    <p className="text-base">{client.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                                    <p className="text-base">{client.phone_number || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                                    <p className="text-base">{format(new Date(client.created_at), 'PPP')}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-muted-foreground">Address</label>
                                    <p className="text-base">{client.address || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Company Name</label>
                                    <p className="text-base">{client.company_name || '-'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Website</label>
                                    <p className="text-base">
                                        {client.company_website ? (
                                            <a href={client.company_website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                                                {client.company_website}
                                            </a>
                                        ) : '-'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground">Status</label>
                                    <p className="text-base capitalize">{client.status || 'Active'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Internal Notes</CardTitle>
                            <CardDescription>
                                Private notes about this client. Only visible to admins.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <Textarea 
                                    placeholder="Add notes here..." 
                                    value={data.metadata?.notes || ''}
                                    onChange={(e) => setData('metadata', { ...data.metadata, notes: e.target.value })}
                                    rows={6}
                                />
                                <div className="flex justify-end">
                                    <Button onClick={handleSaveNotes} disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Notes'}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </AdminLayout>
    );
}
