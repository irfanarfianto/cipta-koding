import React from 'react';
import { Hexagon } from 'lucide-react';

export default function ApplicationLogo({ className }: { className?: string }) {
    return (
        <Hexagon className={className} strokeWidth={2.5} />
    );
}
