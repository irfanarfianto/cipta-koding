import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { Plus, Search, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Author {
    id: string;
    name: string;
}

interface Post {
    id: string;
    title: string;
    slug: string;
    status: 'draft' | 'published';
    published_at: string | null;
    author: Author;
    created_at: string;
}

interface Props {
    posts: {
        data: Post[];
        links: any[];
        meta: any;
    };
    filters: {
        search?: string;
        status?: string;
    };
    statuses: string[];
}

export default function PostIndex({ posts, filters, statuses }: Props) {
    const [search, setSearch] = React.useState(filters.search || '');
    const [statusFilter, setStatusFilter] = React.useState(filters.status || 'all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(route('admin.posts.index'), { 
            search, 
            status: statusFilter === 'all' ? undefined : statusFilter 
        }, { preserveState: true });
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        router.get(route('admin.posts.index'), { 
            search, 
            status: value === 'all' ? undefined : value 
        }, { preserveState: true });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this post?')) {
            router.delete(route('admin.posts.destroy', id));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'bg-green-100 text-green-800 hover:bg-green-100';
            case 'draft': return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout>
            <Head title="Blog Posts" />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Blog Posts</h1>
                    <p className="text-muted-foreground">Manage your blog content and articles.</p>
                </div>
                <Button asChild>
                    <Link href={route('admin.posts.create')}>
                        <Plus className="mr-2 h-4 w-4" /> Create Post
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <CardTitle className="text-lg font-medium">All Posts</CardTitle>
                        <div className="flex flex-col md:flex-row gap-2">
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search posts..."
                                        className="pl-8 w-[250px]"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </form>
                            <Select value={statusFilter} onValueChange={handleStatusChange}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Filter Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {statuses.map((s) => (
                                        <SelectItem key={s} value={s} className="capitalize">
                                            {s}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Author</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Published Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {posts.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                        No posts found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                posts.data.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{post.title}</span>
                                                <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                                                    /{post.slug}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{post.author?.name || 'Unknown'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`capitalize ${getStatusColor(post.status)}`}>
                                                {post.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {post.published_at 
                                                ? format(new Date(post.published_at), 'MMM d, yyyy') 
                                                : <span className="text-muted-foreground">-</span>
                                            }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild>
                                                    <Link href={route('admin.posts.edit', post.id)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="text-destructive hover:text-destructive/90"
                                                    onClick={() => handleDelete(post.id)}
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
                    
                    {/* Pagination would go here if needed, but for now basic list */}
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
