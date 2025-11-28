import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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

interface Project {
    id: string;
    title: string;
    description: string;
    client_id: string | null;
    completed_date: string | null;
    project_url: string | null;
    is_featured: boolean;
}

interface Props {
    project: Project;
    clients: Client[];
}

export default function PortfolioEdit({ project, clients }: Props) {
    const { data, setData, put, processing, errors } = useForm({
        title: project.title,
        description: project.description,
        client_id: project.client_id || '',
        completed_date: project.completed_date ? project.completed_date.split('T')[0] : '',
        project_url: project.project_url || '',
        is_featured: Boolean(project.is_featured),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('admin.portfolio.update', project.id));
    };

    return (
        <AdminLayout>
            <Head title={`Edit Project: ${project.title}`} />

            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link href={route('admin.portfolio.index')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Project</h1>
            </div>

            <div className="max-w-3xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Project Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Project Title</label>
                                <Input
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="e.g. E-commerce Website Redesign"
                                />
                                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Client</label>
                                <Select 
                                    value={data.client_id} 
                                    onValueChange={(val) => setData('client_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Client" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clients.map((client) => (
                                            <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
                            </div>

                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Description</label>
                                <textarea
                                    rows={5}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Describe the project..."
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Completed Date</label>
                                    <Input
                                        type="date"
                                        value={data.completed_date}
                                        onChange={(e) => setData('completed_date', e.target.value)}
                                    />
                                    {errors.completed_date && <p className="text-sm text-destructive">{errors.completed_date}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Project URL</label>
                                    <Input
                                        type="url"
                                        value={data.project_url}
                                        onChange={(e) => setData('project_url', e.target.value)}
                                        placeholder="https://example.com"
                                    />
                                    {errors.project_url && <p className="text-sm text-destructive">{errors.project_url}</p>}
                                </div>
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
                                    Feature this project on homepage
                                </label>
                            </div>

                            <div className="flex justify-end gap-4">
                                <Button variant="outline" asChild>
                                    <Link href={route('admin.portfolio.index')}>Cancel</Link>
                                </Button>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Update Project' : 'Update Project'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
