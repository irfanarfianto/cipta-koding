import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ReactNode, useState } from 'react';

export default function ConfirmDialog({
    title,
    description,
    action,
    children,
}: Readonly<{
    title: string;
    description?: string;
    action: () => void;
    children: ReactNode;
}>) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Batal
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            setOpen(false);
                            action();
                        }}
                    >
                        Ya, lanjutkan
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
