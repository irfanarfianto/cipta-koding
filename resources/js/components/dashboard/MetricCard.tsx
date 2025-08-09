import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type MetricCardProps = {
    readonly title: string;
    readonly value: string | number;
    readonly subtitle?: string;
    readonly rightSlot?: React.ReactNode;
};
export default function MetricCard({ title, value, subtitle, rightSlot }: MetricCardProps) {
    return (
        <Card className="relative overflow-hidden">
            <CardHeader className="pb-0">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-sm text-neutral-500">{title}</CardTitle>
                    {rightSlot}
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="text-4xl font-semibold">{value}</div>
                {subtitle && <div className="mt-1 text-xs text-neutral-500">{subtitle}</div>}
            </CardContent>
        </Card>
    );
}
