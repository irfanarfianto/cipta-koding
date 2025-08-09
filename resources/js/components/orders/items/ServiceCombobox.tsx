import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { formatRupiah } from '@/utils/formatCurrency';
import { Check, ChevronsUpDown } from 'lucide-react';

export type ServiceLite = { id: string; name: string; base_price?: number | string | null };

type Props = {
    services: readonly ServiceLite[];
    value?: string; // service_id terpilih
    onSelect: (serviceId: string) => void;
    buttonClassName?: string;
};

export default function ServiceCombobox({ services, value, onSelect, buttonClassName }: Props) {
    const active = services.find((s) => s.id === value);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    className={cn('w-full justify-between', !active && 'text-muted-foreground', buttonClassName)}
                >
                    {active ? active.name : 'Pilih service…'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Cari service…" />
                    <CommandList>
                        <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                            {services.map((s) => {
                                const isActive = s.id === value;
                                return (
                                    <CommandItem key={s.id} value={s.name} onSelect={() => onSelect(s.id)} className="cursor-pointer">
                                        <Check className={cn('mr-2 h-4 w-4', isActive ? 'opacity-100' : 'opacity-0')} />
                                        <div className="flex w-full items-center justify-between">
                                            <span>{s.name}</span>
                                            {s.base_price != null && (
                                                <span className="text-xs text-muted-foreground">{formatRupiah(Number(s.base_price || 0))}</span>
                                            )}
                                        </div>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
