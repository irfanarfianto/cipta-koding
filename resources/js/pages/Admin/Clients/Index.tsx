import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Plus, Edit, Eye, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Client {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    company_name: string;
    status: string;
    orders_count: number;
}

interface Props {
    clients: {
        data: Client[];
        links: any[];
    };
}

export default function ClientsIndex({ clients }: Props) {
    return (
        <AdminLayout>
            <Head title="Manage Clients" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Clients</h2>
                    <p className="text-muted-foreground">
                        A list of all your clients and their contact information.
                    </p>
                </div>
                <Button asChild>
                    <Link href={route('admin.clients.create')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Client
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Orders</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {clients.data.map((client) => (
                            <TableRow key={client.id}>
                                <TableCell className="font-medium">
                                    <Link href={route('admin.clients.show', client.id)} className="hover:underline text-primary">
                                        {client.name}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3 h-3" /> {client.email}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3 h-3" /> {client.phone_number}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {client.company_name || '-'}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                                        {client.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {client.orders_count}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={route('admin.clients.show', client.id)}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={route('admin.clients.edit', client.id)}>
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
        </AdminLayout>
    );
}
