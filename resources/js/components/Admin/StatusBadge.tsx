import React from 'react';

interface StatusBadgeProps {
    status: string;
    type?: 'order' | 'invoice' | 'general';
}

export default function StatusBadge({ status, type = 'general' }: StatusBadgeProps) {
    const getColors = (status: string) => {
        const s = status.toLowerCase();
        
        // Order Statuses
        if (s.includes('menunggu') || s.includes('pending')) return 'bg-yellow-100 text-yellow-800';
        if (s.includes('selesai') || s.includes('paid') || s.includes('active')) return 'bg-green-100 text-green-800';
        if (s.includes('batal') || s.includes('rejected') || s.includes('inactive')) return 'bg-red-100 text-red-800';
        if (s.includes('sedang') || s.includes('process')) return 'bg-blue-100 text-blue-800';
        
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getColors(status)}`}>
            {status}
        </span>
    );
}
