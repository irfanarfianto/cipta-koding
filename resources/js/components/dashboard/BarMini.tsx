type BarMiniProps = {
    labels: string[];
    values: number[];
    className?: string;
};

export default function BarMini({ labels, values, className }: BarMiniProps) {
    const max = Math.max(1, ...values);
    return (
        <div className={className}>
            <div className="grid h-32 grid-cols-12 items-end gap-2">
                {values.map((v, i) => {
                    const h = Math.round((v / max) * 100);
                    return (
                        <div key={i} className="flex flex-col items-center gap-1">
                            <div className="w-full rounded bg-neutral-300 dark:bg-neutral-700" style={{ height: `${h}%` }} />
                            <div className="text-[10px] text-neutral-500">{labels[i]?.slice(2)}</div>
                        </div>
                    );
                })}
                {values.length === 0 && <div className="text-sm text-neutral-500">Belum ada data</div>}
            </div>
        </div>
    );
}
