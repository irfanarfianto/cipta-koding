import { Button } from '@/components/ui/button';

export default function NotFound({ status, message }: { readonly status: number; readonly message?: string }) {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="text-6xl font-bold">{status}</h1>
            <p className="mt-4 text-xl">{message ?? 'Halaman tidak ditemukan'}</p>

            <Button className="mt-6" variant="outline" onClick={() => window.history.back()}>
                Kembali
            </Button>
        </div>
    );
}
