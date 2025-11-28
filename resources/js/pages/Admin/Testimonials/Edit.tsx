import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Client {
    id: string;
    name: string;
}

interface Testimonial {
    id: string;
    client_id: string | null;
    client_name: string;
    client_position: string;
    content: string;
    is_featured: boolean;
}

interface Props {
    testimonial: Testimonial;
    clients: Client[];
}

export default function TestimonialEdit({ testimonial, clients }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        client_id: testimonial.client_id || 'manual',
        client_name: testimonial.client_name,
        client_position: testimonial.client_position || '',
        content: testimonial.content,
        is_featured: testimonial.is_featured,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submitData = {
            ...data,
            client_id: data.client_id === 'manual' ? null : data.client_id,
        };
        put(route('admin.testimonials.update', testimonial.id), {
            data: submitData
        });
    };

    const handleClientChange = (val: string) => {
        setData('client_id', val);
        if (val !== 'manual') {
            const client = clients.find(c => c.id === val);
            if (client) {
                setData(prev => ({
                    ...prev,
                    client_id: val,
                    client_name: client.name,
                }));
            }
        }
    };

    return (
        <AdminLayout>
            <Head title="Edit Testimonial" />

            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link href={route('admin.testimonials.index')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Testimonial</h1>
            </div>

            <div className="max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Testimonial Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Link to Client (Optional)</label>
                                <Select 
                                    value={data.client_id || 'manual'} 
                                    onValueChange={handleClientChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Client or Enter Manually" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="manual">Enter Manually</SelectItem>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Client Name</label>
                                <Input
                                    value={data.client_name}
                                    onChange={(e) => setData('client_name', e.target.value)}
                                    placeholder="e.g. Jane Doe"
                                    disabled={data.client_id !== 'manual' && data.client_id !== null}
                                />
                                {errors.client_name && <p className="text-sm text-destructive">{errors.client_name}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Position / Company</label>
                                <Input
                                    value={data.client_position}
                                    onChange={(e) => setData('client_position', e.target.value)}
                                    placeholder="e.g. CEO at TechCorp"
                                />
                                {errors.client_position && <p className="text-sm text-destructive">{errors.client_position}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Content</label>
                                <Textarea
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    placeholder="Testimonial text..."
                                    rows={4}
                                />
                                {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox 
                                    id="is_featured" 
                                    checked={data.is_featured}
                                    onCheckedChange={(checked) => setData('is_featured', checked as boolean)}
                                />
                                <label
                                    htmlFor="is_featured"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Feature this testimonial
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.testimonials.index')}>Cancel</Link>
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
