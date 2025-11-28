import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import toast, { Toaster } from 'react-hot-toast';
import { initializeTheme } from './hooks/use-appearance';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <>
                <App {...props} />
                <Toaster position="bottom-right" toastOptions={{ duration: 3500, style: { background: '#111827', color: '#fff' } }} />
            </>,
        );

        // ✅ Tampilkan flash pada render pertama (initial page)
        type FlashProps = {
            success?: string;
            error?: string;
            info?: string;
        };

        type InitialPageProps = {
            props?: {
                flash?: FlashProps;
            };
        };

        const initialFlash = (props as { initialPage?: InitialPageProps })?.initialPage?.props?.flash || {};
        if (initialFlash.success) toast.success(initialFlash.success);
        if (initialFlash.error) toast.error(initialFlash.error);
        if (initialFlash.info) toast(initialFlash.info);
    },
    progress: { color: '#4B5563' },
});

// ✅ Tampilkan flash pada navigasi berikutnya
router.on('success', (event) => {
    // Safely access flash property from event.detail.page.props
    const flash =
        (event?.detail?.page?.props &&
            'flash' in event.detail.page.props &&
            (event.detail.page.props as { flash?: { success?: string; error?: string; info?: string } }).flash) ||
        {};
    if (flash?.success) toast.success(flash.success);
    if (flash?.error) toast.error(flash.error);
    if (flash?.info) toast(flash.info);
});

// Opsional: test manual (hapus setelah yakin)
// setTimeout(() => toast.success('Toaster siap!'), 500);

// Theme init
initializeTheme();
