import { AlertTriangle, type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import { AppCard, AppCardContent, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { cn } from '@/Lib/utils';

export interface AppErrorStateProps {
    title?: string;
    description: string;
    action?: ReactNode;
    icon?: LucideIcon;
    className?: string;
}

export function AppErrorState({
    title = 'Something needs attention',
    description,
    action,
    icon: Icon = AlertTriangle,
    className,
}: AppErrorStateProps) {
    return (
        <AppCard className={cn('border-rose-200/90 bg-rose-50/60', className)}>
            <AppCardHeader className="flex-row items-start gap-4">
                <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
                    <Icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                    <AppCardTitle className="text-base">{title}</AppCardTitle>
                    <p className="text-sm leading-6 text-rose-900/80">{description}</p>
                </div>
            </AppCardHeader>
            {action ? <AppCardContent className="pt-0">{action}</AppCardContent> : null}
        </AppCard>
    );
}
