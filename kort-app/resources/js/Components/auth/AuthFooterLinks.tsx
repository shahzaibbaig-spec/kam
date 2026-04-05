import { AppLink, type AppLinkMethod } from '@/Components/ui/AppLink';

export interface AuthFooterLinkItem {
    label: string;
    href: string;
    method?: AppLinkMethod;
}

export interface AuthFooterLinksProps {
    items: AuthFooterLinkItem[];
}

export function AuthFooterLinks({ items }: AuthFooterLinksProps) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            {items.map((item) => (
                <AppLink key={`${item.label}-${item.href}`} href={item.href} method={item.method} className="font-medium text-blue-700 transition hover:text-blue-800">
                    {item.label}
                </AppLink>
            ))}
        </div>
    );
}
