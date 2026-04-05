import { ChevronRight, Home } from 'lucide-react';

import { AppLink } from '@/Components/ui/AppLink';
import type { AppBreadcrumbItem } from '@/types/app-shell';

export interface AppBreadcrumbsProps {
    items: AppBreadcrumbItem[];
}

export function AppBreadcrumbs({ items }: AppBreadcrumbsProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Home className="h-4 w-4 text-slate-400" />
            {items.map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-slate-300" />
                    {item.href ? (
                        <AppLink href={item.href} className="transition hover:text-slate-700">
                            {item.label}
                        </AppLink>
                    ) : (
                        <span className="font-medium text-slate-700">{item.label}</span>
                    )}
                </div>
            ))}
        </nav>
    );
}
