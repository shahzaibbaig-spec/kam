import { router } from '@inertiajs/core';
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent } from 'react';

import { cn } from '@/Lib/utils';

export type AppLinkMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface AppLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
    href: string;
    method?: AppLinkMethod;
    data?: Record<string, unknown>;
    preserveScroll?: boolean;
    preserveState?: boolean;
    replace?: boolean;
    only?: string[];
    headers?: Record<string, string>;
    disabled?: boolean;
}

export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
    (
        {
            href,
            method = 'get',
            data,
            preserveScroll,
            preserveState,
            replace,
            only,
            headers,
            disabled = false,
            onClick,
            className,
            target,
            children,
            ...props
        },
        ref,
    ) => {
        const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
            onClick?.(event);

            if (event.defaultPrevented) {
                return;
            }

            if (disabled) {
                event.preventDefault();

                return;
            }

            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
                return;
            }

            if (target && target !== '_self') {
                return;
            }

            event.preventDefault();

            router.visit(href, {
                method,
                data: data as never,
                preserveScroll,
                preserveState,
                replace,
                only,
                headers,
            });
        };

        return (
            <a
                ref={ref}
                href={href}
                target={target}
                aria-disabled={disabled || undefined}
                className={cn(disabled ? 'pointer-events-none opacity-60' : '', className)}
                onClick={handleClick}
                {...props}
            >
                {children}
            </a>
        );
    },
);

AppLink.displayName = 'AppLink';
