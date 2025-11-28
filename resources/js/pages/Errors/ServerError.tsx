import { Button } from '@/components/ui/button';
import { Link } from '@inertiajs/react';

export default function ServerError({ status, message }: { readonly status: number; readonly message?: string }) {
    // Pesan default berdasarkan status
    const defaultMessages: Record<number, string> = {
        401: 'Anda perlu login untuk mengakses halaman ini.',
        403: 'Anda tidak memiliki izin untuk mengakses halaman ini.',
        419: 'Sesi Anda telah kedaluwarsa. Silakan muat ulang halaman.',
        429: 'Terlalu banyak permintaan. Silakan coba lagi nanti.',
        500: 'Terjadi kesalahan pada server.',
    };

    const displayMessage = message || defaultMessages[status] || 'Terjadi kesalahan.';

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
            <h1 className="text-7xl font-bold text-red-600">{status}</h1>
            <p className="mt-4 text-center text-2xl font-semibold">{displayMessage}</p>

            <p className="mt-2 max-w-md text-center text-muted-foreground">
                Silakan coba lagi beberapa saat atau hubungi administrator jika masalah berlanjut.
            </p>

            <div className="mt-6 flex gap-3">
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Coba Lagi
                </Button>
                <Button asChild>
                    <Link href="/dashboard">Ke Dashboard</Link>
                </Button>
            </div>
        </div>
    );
}
