import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Plus, Edit, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Components/ui/table"

interface Service {
    id: string;
    name: string;
    category: string;
    base_price: number;
    is_active: boolean;
}

interface Props {
    services: {
        data: Service[];
        links: any[];
    };
}

export default function ServicesIndex({ services }: Props) {
    return (
        <AdminLayout>
            <Head title="Manage Services" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Services</h2>
                    <p className="text-muted-foreground">
                        Manage your service catalog, pricing, and availability.
                    </p>
                </div>
                <Button asChild>
                    <Link href={route('admin.services.create')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Service
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Base Price</TableHead>
                            <TableHead>Active</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {services.data.map((service) => (
                            <TableRow key={service.id}>
                                <TableCell className="font-medium">
                                    {service.name}
                                </TableCell>
                                <TableCell>{service.category}</TableCell>
                                <TableCell>
                                    Rp {Number(service.base_price).toLocaleString()}
                                </TableCell>
                                <TableCell>
                                    {service.is_active ? (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                            <Check className="w-3 h-3 mr-1" /> Active
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                            <X className="w-3 h-3 mr-1" /> Inactive
                                        </Badge>
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={route('admin.services.edit', service.id)}>
                                                <Edit className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
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
