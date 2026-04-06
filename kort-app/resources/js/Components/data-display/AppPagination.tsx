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
    links: AppPaginationLink[] | Record<string, unknown> | null | undefined;
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
    const normalizedLinks = normalizeLinks(links);

    if (normalizedLinks.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {normalizedLinks.map((link) => {
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

function normalizeLinks(input: AppPaginationProps['links']): AppPaginationLink[] {
    if (!input) {
        return [];
    }

    if (Array.isArray(input)) {
        return input.filter(isPaginationLink);
    }

    const maybeObject = input as Record<string, unknown>;
    const looksLikeLaravelSimplePaginator =
        'first' in maybeObject || 'last' in maybeObject || 'prev' in maybeObject || 'next' in maybeObject;

    if (looksLikeLaravelSimplePaginator) {
        const prev = maybeObject.prev;
        const next = maybeObject.next;

        return [
            {
                label: 'Previous',
                url: typeof prev === 'string' ? prev : null,
                active: false,
            },
            {
                label: 'Next',
                url: typeof next === 'string' ? next : null,
                active: false,
            },
        ];
    }

    return Object.values(maybeObject).filter(isPaginationLink);
}

function isPaginationLink(value: unknown): value is AppPaginationLink {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Record<string, unknown>;
    const hasLabel = typeof candidate.label === 'string';
    const hasActive = typeof candidate.active === 'boolean';
    const hasValidUrl = candidate.url === null || typeof candidate.url === 'string';

    return hasLabel && hasActive && hasValidUrl;
}
