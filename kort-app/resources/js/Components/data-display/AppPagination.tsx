import { ChevronLeft, ChevronRight } from 'lucide-react';

import { AppLink } from '@/Components/ui/AppLink';
import { AppButton } from '@/Components/ui/AppButton';
import { cn } from '@/Lib/utils';

export interface AppPaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface AppPaginationProps {
    links: AppPaginationLink[];
}

function getChevronIcon(label: string) {
    if (label.includes('Previous') || label.includes('&laquo;')) {
        return ChevronLeft;
    }

    if (label.includes('Next') || label.includes('&raquo;')) {
        return ChevronRight;
    }

    return null;
}

export function AppPagination({ links }: AppPaginationProps) {
    return (
        <div className="flex flex-wrap items-center gap-2">
            {links.map((link) => {
                const Icon = getChevronIcon(link.label);

                if (!link.url) {
                    return (
                        <AppButton key={link.label} variant="outline" size="sm" disabled className="opacity-50">
                            {Icon ? <Icon className="h-4 w-4" /> : null}
                            {!Icon ? <span dangerouslySetInnerHTML={{ __html: link.label }} /> : null}
                        </AppButton>
                    );
                }

                return (
                    <AppButton
                        key={`${link.label}-${link.url}`}
                        asChild
                        variant={link.active ? 'primary' : 'outline'}
                        size="sm"
                        className={cn(link.active ? 'shadow-panel' : '')}
                    >
                        <AppLink href={link.url}>
                            {Icon ? <Icon className="h-4 w-4" /> : null}
                            {!Icon ? <span dangerouslySetInnerHTML={{ __html: link.label }} /> : null}
                        </AppLink>
                    </AppButton>
                );
            })}
        </div>
    );
}
