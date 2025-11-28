import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Plus, Edit, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Testimonial {
    id: string;
    client_name: string;
    client_position: string;
    content: string;
    is_featured: boolean;
    created_at: string;
}

interface Props {
    testimonials: {
        data: Testimonial[];
        links: any[];
    };
    filters: {
        featured?: string;
    };
}

export default function TestimonialIndex({ testimonials }: Props) {
    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this testimonial?')) {
            router.delete(route('admin.testimonials.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Testimonials" />

            <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Testimonials</h1>
                    <p className="text-muted-foreground">Manage client testimonials.</p>
                </div>
                <Button asChild>
                    <Link href={route('admin.testimonials.create')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Testimonial
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Testimonials</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Client Name</TableHead>
                                <TableHead>Position</TableHead>
                                <TableHead>Content</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {testimonials.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No testimonials found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                testimonials.data.map((item) => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.client_name}</TableCell>
                                        <TableCell>{item.client_position}</TableCell>
                                        <TableCell className="max-w-md truncate">{item.content}</TableCell>
                                        <TableCell>
                                            {item.is_featured && (
                                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                                    <Star className="mr-1 h-3 w-3 fill-yellow-800" /> Featured
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('admin.testimonials.edit', item.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:text-destructive/90"
                                                    onClick={() => handleDelete(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
