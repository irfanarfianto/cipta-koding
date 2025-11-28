import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
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
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';

interface Project {
    id: string;
    title: string;
    slug: string;
    client?: {
        name: string;
    };
    completed_date: string;
    project_url?: string;
    is_featured: boolean;
}

interface Props {
    projects: {
        data: Project[];
        links: any[];
    };
    filters: {
        search?: string;
    };
}

export default function PortfolioIndex({ projects, filters }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.portfolio.index'), { search }, { preserveState: true });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this project?')) {
            router.delete(route('admin.portfolio.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <Head title="Portfolio" />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Portfolio</h2>
                    <p className="text-muted-foreground">
                        Manage your portfolio projects and showcase your work.
                    </p>
                </div>
                <Button asChild>
                    <Link href={route('admin.portfolio.create')}>
                        <Plus className="mr-2 h-4 w-4" /> Add Project
                    </Link>
                </Button>
            </div>

            <div className="mb-6">
                <form onSubmit={handleSearch} className="flex gap-2 max-w-sm">
                    <Input
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button type="submit" variant="secondary">Search</Button>
                </form>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Client</TableHead>
                            <TableHead>Completed Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {projects.data.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No projects found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            projects.data.map((project) => (
                                <TableRow key={project.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{project.title}</span>
                                            {project.project_url && (
                                                <a 
                                                    href={project.project_url} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="text-xs text-muted-foreground flex items-center hover:underline"
                                                >
                                                    {project.project_url} <ExternalLink className="ml-1 h-3 w-3" />
                                                </a>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{project.client?.name || '-'}</TableCell>
                                    <TableCell>
                                        {project.completed_date ? format(new Date(project.completed_date), 'MMM d, yyyy') : '-'}
                                    </TableCell>
                                    <TableCell>
                                        {project.is_featured && (
                                            <Badge variant="secondary">Featured</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={route('admin.portfolio.edit', project.id)}>
                                                    <Edit className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(project.id)}
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
            </div>
        </AdminLayout>
    );
}
