import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Tag {
    id: string;
    name: string;
}

interface Props {
    tags: Tag[];
}

export default function PostCreate({ tags }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        title: '',
        slug: '',
        excerpt: '',
        body: '',
        cover_image_url: '',
        status: 'draft',
        published_at: '',
        tag_ids: [] as string[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.posts.store'));
    };

    const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = Array.from(e.target.selectedOptions, option => option.value);
        setData('tag_ids', options);
    };

    return (
        <AdminLayout>
            <Head title="Create Post" />

            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link href={route('admin.posts.index')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Create New Post</h1>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Post Content</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Title</label>
                                    <Input
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="Enter post title"
                                    />
                                    {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Slug (Optional)</label>
                                    <Input
                                        value={data.slug}
                                        onChange={(e) => setData('slug', e.target.value)}
                                        placeholder="Leave empty to auto-generate"
                                    />
                                    {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Excerpt</label>
                                    <Textarea
                                        value={data.excerpt}
                                        onChange={(e) => setData('excerpt', e.target.value)}
                                        placeholder="Short summary of the post..."
                                        rows={3}
                                    />
                                    {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Content</label>
                                    <Textarea
                                        value={data.body}
                                        onChange={(e) => setData('body', e.target.value)}
                                        placeholder="Write your post content here..."
                                        className="min-h-[400px] font-mono"
                                    />
                                    {errors.body && <p className="text-sm text-destructive">{errors.body}</p>}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Publishing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Status</label>
                                    <Select 
                                        value={data.status} 
                                        onValueChange={(val) => setData('status', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="draft">Draft</SelectItem>
                                            <SelectItem value="published">Published</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {errors.status && <p className="text-sm text-destructive">{errors.status}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Published Date</label>
                                    <Input
                                        type="datetime-local"
                                        value={data.published_at}
                                        onChange={(e) => setData('published_at', e.target.value)}
                                    />
                                    {errors.published_at && <p className="text-sm text-destructive">{errors.published_at}</p>}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Media & Taxonomy</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Cover Image URL</label>
                                    <Input
                                        value={data.cover_image_url}
                                        onChange={(e) => setData('cover_image_url', e.target.value)}
                                        placeholder="https://..."
                                    />
                                    {errors.cover_image_url && <p className="text-sm text-destructive">{errors.cover_image_url}</p>}
                                </div>

                                <div className="grid gap-2">
                                    <label className="text-sm font-medium">Tags</label>
                                    <select
                                        multiple
                                        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={data.tag_ids}
                                        onChange={handleTagChange}
                                        style={{ minHeight: '150px' }}
                                    >
                                        {tags.map(tag => (
                                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-muted-foreground">Hold Ctrl/Cmd to select multiple</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing ? 'Saving...' : 'Create Post'}
                        </Button>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
