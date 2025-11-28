import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import StatusBadge from '@/components/Admin/StatusBadge';
import { Search, Plus, Eye, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Order {
    id: string;
    order_code: string;
    client: { name: string; email: string };
    status: string;
    final_amount: number;
    created_at: string;
}

interface Props {
    orders: {
        data: Order[];
        links: any[];
        meta: any;
    };
    filters: {
        status?: string;
        search?: string;
    };
    statuses: string[];
}

export default function OrdersIndex({ orders, filters, statuses }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.orders.index'), { search, status: status === 'all' ? '' : status }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatus(value);
        router.get(route('admin.orders.index'), { search, status: value === 'all' ? '' : value }, { preserveState: true });
    };

    return (
        <AdminLayout>
            <Head title="Manage Orders" />

            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
                    <p className="text-muted-foreground">
                        Manage and track all customer orders here.
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href={route('admin.orders.create')}>
                            <Plus className="mr-2 h-4 w-4" /> Add Order
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="space-y-4 mt-8">
                {/* Filters */}
                <div className="flex items-center justify-between">
                    <form onSubmit={handleSearch} className="flex flex-1 items-center space-x-2">
                        <Input
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-8 w-[150px] lg:w-[250px]"
                        />
                        <Button type="submit" variant="outline" size="sm">
                            Search
                        </Button>
                    </form>
                    <div className="flex items-center space-x-2">
                         <Select value={status} onValueChange={handleStatusChange}>
                            <SelectTrigger className="h-8 w-[180px]">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                {statuses.map((s) => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order Code</TableHead>
                                <TableHead>Client</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.data.map((order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">
                                        <Link href={route('admin.orders.show', order.id)} className="hover:underline">
                                            {order.order_code}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{order.client?.name}</span>
                                            <span className="text-xs text-muted-foreground">{order.client?.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={order.status} />
                                    </TableCell>
                                    <TableCell>
                                        Rp {Number(order.final_amount).toLocaleString()}
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(order.created_at), 'dd MMM yyyy')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={route('admin.orders.show', order.id)}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={route('admin.orders.edit', order.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
}
