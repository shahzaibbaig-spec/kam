import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import { AppLink } from '@/Components/ui/AppLink';
import type { AppDropdownItem } from '@/types/app-shell';
import { cn } from '@/Lib/utils';

export interface AppDropdownProps {
    trigger: ReactNode;
    items: AppDropdownItem[];
    align?: 'start' | 'center' | 'end';
    contentClassName?: string;
}

function DropdownItemIcon({ icon: Icon }: { icon?: LucideIcon }) {
    if (!Icon) {
        return <span className="w-4" />;
    }

    return <Icon className="h-4 w-4 text-slate-500" />;
}

export function AppDropdown({ trigger, items, align = 'end', contentClassName }: AppDropdownProps) {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
            <DropdownMenu.Portal>
                <DropdownMenu.Content
                    sideOffset={10}
                    align={align}
                    className={cn(
                        'z-50 min-w-[12rem] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-surface',
                        contentClassName,
                    )}
                >
                    {items.map((item, index) => {
                        if (item.label === 'separator') {
                            return <DropdownMenu.Separator key={`separator-${index}`} className="my-1 h-px bg-slate-100" />;
                        }

                        if (item.href) {
                            return (
                                <DropdownMenu.Item key={`${item.label}-${item.href}`} asChild disabled={item.disabled}>
                                    <AppLink
                                        href={item.href}
                                        method={item.method}
                                        className={cn(
                                            'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none transition hover:bg-slate-50 focus:bg-slate-50',
                                            item.destructive ? 'text-rose-700' : '',
                                            item.disabled ? 'pointer-events-none opacity-50' : '',
                                        )}
                                    >
                                        <DropdownItemIcon icon={item.icon} />
                                        <span className="flex-1">{item.label}</span>
                                        {item.method && item.method !== 'get' ? <ChevronRight className="h-3.5 w-3.5" /> : null}
                                    </AppLink>
                                </DropdownMenu.Item>
                            );
                        }

                        return (
                            <DropdownMenu.Item
                                key={`${item.label}-${index}`}
                                disabled={item.disabled}
                                onSelect={(event) => {
                                    event.preventDefault();
                                    item.onSelect?.();
                                }}
                                className={cn(
                                    'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none transition hover:bg-slate-50 focus:bg-slate-50',
                                    item.destructive ? 'text-rose-700' : '',
                                    item.disabled ? 'pointer-events-none opacity-50' : '',
                                )}
                            >
                                <DropdownItemIcon icon={item.icon} />
                                <span className="flex-1">{item.label}</span>
                            </DropdownMenu.Item>
                        );
                    })}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
