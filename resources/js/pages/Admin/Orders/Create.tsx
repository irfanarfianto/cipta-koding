import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/layouts/AdminLayout';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Props {
    clients: { id: string; name: string; email: string }[];
    services: { id: string; name: string; base_price: number }[];
    statuses: string[];
    defaults: any;
}

export default function OrderCreate({ clients, services, statuses, defaults }: Props) {
    const [items, setItems] = useState([{ service_id: '', quantity: 1, price: 0 }]);
    
    const { data, setData, post, processing, errors } = useForm({
        client_id: defaults.client_id || '',
        status: 'Menunggu Konfirmasi',
        notes: defaults.notes || '',
        items: [] as any[],
    });

    const addItem = () => {
        setItems([...items, { service_id: '', quantity: 1, price: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };
        
        // Auto-fill price when service changes
        if (field === 'service_id') {
            const service = services.find(s => s.id === value);
            if (service) {
                item.price = service.base_price;
            }
        }
        
        newItems[index] = item;
        setItems(newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        data.items = items;
        post(route('admin.orders.store'));
    };

    const calculateTotal = () => {
        return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    return (
        <AdminLayout>
            <Head title="Create New Order" />

            <div className="flex items-center gap-4 mb-6">
                <Button variant="outline" size="icon" asChild>
                    <Link href={route('admin.orders.index')}>
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Create New Order</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Left Column: Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Client & Status */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Order Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-6">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <label htmlFor="client_id" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Client</label>
                                        <Select 
                                            value={data.client_id} 
                                            onValueChange={(val) => setData('client_id', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a Client" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {clients.map((client) => (
                                                    <SelectItem key={client.id} value={client.id}>
                                                        {client.name} ({client.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.client_id && <p className="text-sm text-destructive">{errors.client_id}</p>}
                                    </div>

                                    <div className="grid gap-2">
                                        <label htmlFor="status" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Status</label>
                                        <Select 
                                            value={data.status} 
                                            onValueChange={(val) => setData('status', val)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {statuses.map((s) => (
                                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                
                                <div className="grid gap-2">
                                    <label htmlFor="notes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Notes</label>
                                    <textarea
                                        id="notes"
                                        rows={3}
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Order Items */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle>Order Items</CardTitle>
                                <Button type="button" size="sm" onClick={addItem} variant="secondary">
                                    <Plus className="w-4 h-4 mr-2" /> Add Item
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-4">
                                {items.map((item, index) => (
                                    <div key={index} className="flex items-start gap-4 p-4 border rounded-md bg-muted/50">
                                        <div className="flex-1 grid gap-2">
                                            <label className="text-xs font-medium">Service</label>
                                            <Select 
                                                value={item.service_id} 
                                                onValueChange={(val) => updateItem(index, 'service_id', val)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Service" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {services.map((s) => (
                                                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="w-24 grid gap-2">
                                            <label className="text-xs font-medium">Qty</label>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="w-40 grid gap-2">
                                            <label className="text-xs font-medium">Price (Rp)</label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={item.price}
                                                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div className="pt-6">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                onClick={() => removeItem(index)}
                                                disabled={items.length === 1}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Summary</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Total Items</span>
                                    <span className="font-medium">{items.reduce((acc, item) => acc + item.quantity, 0)}</span>
                                </div>
                                <div className="flex justify-between py-4 text-lg font-bold">
                                    <span>Total Amount</span>
                                    <span>Rp {calculateTotal().toLocaleString()}</span>
                                </div>
                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    disabled={processing}
                                >
                                    {processing ? 'Creating Order...' : 'Create Order'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
