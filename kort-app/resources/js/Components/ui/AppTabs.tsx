import * as Tabs from '@radix-ui/react-tabs';
import { type ReactNode } from 'react';

import { cn } from '@/Lib/utils';

export interface AppTabItem {
    value: string;
    label: string;
    content: ReactNode;
}

export interface AppTabsProps {
    defaultValue?: string;
    items: AppTabItem[];
    className?: string;
}

export function AppTabs({ defaultValue, items, className }: AppTabsProps) {
    const resolvedValue = defaultValue ?? items[0]?.value;

    return (
        <Tabs.Root defaultValue={resolvedValue} className={cn('space-y-4', className)}>
            <Tabs.List className="inline-flex rounded-2xl border border-slate-200 bg-slate-100 p-1">
                {items.map((item) => (
                    <Tabs.Trigger
                        key={item.value}
                        value={item.value}
                        className="app-focus-ring rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm"
                    >
                        {item.label}
                    </Tabs.Trigger>
                ))}
            </Tabs.List>

            {items.map((item) => (
                <Tabs.Content key={item.value} value={item.value} className="outline-none">
                    {item.content}
                </Tabs.Content>
            ))}
        </Tabs.Root>
    );
}
