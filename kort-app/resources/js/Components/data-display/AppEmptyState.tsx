import { Inbox, type LucideIcon } from 'lucide-react';
import { type ComponentProps, type ReactNode } from 'react';

import { AppButton } from '@/Components/ui/AppButton';
import { cn } from '@/Lib/utils';

export interface AppEmptyStateProps {
    title: string;
    description?: string;
    icon?: LucideIcon;
    action?: ReactNode;
    className?: string;
}

export function AppEmptyState({ title, description, icon: Icon = Inbox, action, className }: AppEmptyStateProps) {
    return (
        <div className={cn('flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center', className)}>
            <div className="mb-4 rounded-2xl bg-primary-soft p-3 text-blue-700">
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description ? <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p> : null}
            {action ? <div className="mt-5">{action}</div> : null}
        </div>
    );
}

export function AppEmptyStateAction(props: ComponentProps<typeof AppButton>) {
    return <AppButton variant="soft" {...props} />;
}
