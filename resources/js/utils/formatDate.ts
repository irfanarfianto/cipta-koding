// utils/formatDate.ts
import { format } from 'date-fns';
import { parseISO } from 'date-fns/parseISO';

export function formatTanggal(dateString?: string | null, withTime = false): string {
    if (!dateString) return '-';

    try {
        const date = parseISO(dateString);
        return format(date, withTime ? 'd MMMM yyyy HH:mm' : 'd MMMM yyyy');
    } catch {
        return dateString;
    }
}
