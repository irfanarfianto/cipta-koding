import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function Index() {
    return (
        <AppLayout breadcrumbs={[{ title: 'Invoices', href: '/admin/invoices' }]}>
            <Head title="Invoices" />
            <div className="p-4">Invoices — coming soon.</div>
        </AppLayout>
    );
}
