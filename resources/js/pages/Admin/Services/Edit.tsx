import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';

interface Service {
    id: string;
    name: string;
    description: string;
    base_price: number;
    is_active: boolean;
}

interface Props {
    service: Service;
}

export default function ServiceEdit({ service }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        name: service.name,
        description: service.description || '',
        base_price: service.base_price,
        is_active: Boolean(service.is_active),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.services.update', service.id));
    };

    return (
        <AdminLayout>
            <Head title={`Edit Service ${service.name}`} />

            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link href={route('admin.services.index')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Service</h1>
            </div>

            <div className="max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Service Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Service Name</label>
                                <Input
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g. Web Development Basic"
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    rows={4}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Describe the service..."
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Base Price (IDR)</label>
                                <Input
                                    type="number"
                                    value={data.base_price}
                                    onChange={(e) => setData('base_price', Number(e.target.value))}
                                    placeholder="0"
                                />
                                {errors.base_price && <p className="text-sm text-destructive">{errors.base_price}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="is_active" 
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', !!checked)}
                                />
                                <label
                                    htmlFor="is_active"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Active (Available for order)
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.services.index')}>
                                        Cancel
                                    </Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
