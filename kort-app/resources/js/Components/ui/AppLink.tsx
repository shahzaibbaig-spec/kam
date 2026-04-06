import { router } from '@inertiajs/vue3';
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

interface ResolvedHref {
    anchorHref: string;
    visitHref: string;
    external: boolean;
}

function resolveHref(href: string): ResolvedHref {
    if (typeof window === 'undefined') {
        return {
            anchorHref: href,
            visitHref: href,
            external: false,
        };
    }

    try {
        const parsed = new URL(href, window.location.href);
        const localDevHosts = new Set(['localhost', '127.0.0.1', '::1']);
        const sameHostname = parsed.hostname === window.location.hostname;
        const normalizedPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;

        // Guard against production links generated with local APP_URL values.
        if (parsed.origin !== window.location.origin && localDevHosts.has(parsed.hostname)) {
            return {
                anchorHref: `${window.location.origin}${normalizedPath}`,
                visitHref: normalizedPath,
                external: false,
            };
        }

        // Also normalize absolute links pointing to the same hostname but a different scheme.
        // This commonly happens when APP_URL is set to http on a https deployment.
        if (parsed.origin !== window.location.origin && sameHostname) {
            return {
                anchorHref: `${window.location.origin}${normalizedPath}`,
                visitHref: normalizedPath,
                external: false,
            };
        }

        const external = parsed.origin !== window.location.origin;

        return {
            anchorHref: external ? parsed.toString() : normalizedPath,
            visitHref: normalizedPath,
            external,
        };
    } catch {
        return {
            anchorHref: href,
            visitHref: href,
            external: false,
        };
    }
}

function submitFallback(action: string, method: AppLinkMethod, data?: Record<string, unknown>): void {
    if (typeof window === 'undefined') {
        return;
    }

    const form = document.createElement('form');
    form.method = 'POST';
    form.action = action;
    form.style.display = 'none';

    const appendInput = (name: string, value: unknown) => {
        if (value === undefined || value === null) {
            return;
        }

        if (Array.isArray(value)) {
            value.forEach((item) => appendInput(`${name}[]`, item));

            return;
        }

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value =
            typeof value === 'object'
                ? JSON.stringify(value)
                : String(value);
        form.appendChild(input);
    };

    if (method !== 'post') {
        appendInput('_method', method.toUpperCase());
    }

    const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content;
    if (csrfToken) {
        appendInput('_token', csrfToken);
    }

    if (data) {
        Object.entries(data).forEach(([key, value]) => appendInput(key, value));
    }

    document.body.appendChild(form);
    form.submit();
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
        const resolvedHref = resolveHref(href);

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

            // For regular GET navigation, prefer native browser navigation.
            // This keeps links functional even if Inertia initialization fails in production.
            const hasInertiaGetOptions =
                data !== undefined ||
                preserveScroll !== undefined ||
                preserveState !== undefined ||
                replace !== undefined ||
                headers !== undefined ||
                (only?.length ?? 0) > 0;

            if (method === 'get' && !hasInertiaGetOptions) {
                return;
            }

            if (resolvedHref.external) {
                return;
            }

            event.preventDefault();

            try {
                const visitOptions = {
                    method,
                    data: (data ?? {}) as never,
                    preserveScroll,
                    preserveState,
                    replace,
                    only: only ?? [],
                    headers: headers ?? {},
                };

                router.visit(resolvedHref.visitHref, {
                    ...visitOptions,
                });
            } catch {
                if (method === 'get') {
                    window.location.assign(resolvedHref.anchorHref);

                    return;
                }

                submitFallback(resolvedHref.anchorHref, method, data);
            }
        };

        return (
            <a
                ref={ref}
                href={resolvedHref.anchorHref}
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
