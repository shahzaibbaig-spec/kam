import { motion } from 'framer-motion';
import { AlertTriangle, ShieldAlert, type LucideIcon } from 'lucide-react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard } from '@/Components/data-display/AppCard';
import { AppLink } from '@/Components/ui/AppLink';
import { cn } from '@/Lib/utils';

export interface DashboardAlertCardProps {
    title: string;
    count: number;
    description: string;
    href?: string | null;
    icon?: LucideIcon;
    tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
    statusLabel?: string;
}

const badgeVariantMap: Record<NonNullable<DashboardAlertCardProps['tone']>, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    primary: 'primary',
    success: 'success',
    warning: 'warning',
    danger: 'danger',
    info: 'info',
};

const accentClassMap: Record<NonNullable<DashboardAlertCardProps['tone']>, string> = {
    primary: 'bg-blue-50 text-blue-700 ring-blue-100',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    warning: 'bg-amber-50 text-amber-800 ring-amber-100',
    danger: 'bg-rose-50 text-rose-700 ring-rose-100',
    info: 'bg-sky-50 text-sky-700 ring-sky-100',
};

function AlertCardBody({
    title,
    count,
    description,
    icon: Icon = count > 0 ? ShieldAlert : AlertTriangle,
    tone = 'warning',
    statusLabel,
}: Omit<DashboardAlertCardProps, 'href'>) {
    return (
        <AppCard className="h-full border-slate-200/80">
            <div className="flex h-full flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className={cn('rounded-2xl p-3 ring-1', accentClassMap[tone])}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <AppBadge variant={badgeVariantMap[tone]}>{statusLabel ?? (count > 0 ? 'Needs attention' : 'Stable')}</AppBadge>
                </div>
                <div className="space-y-2">
                    <p className="text-3xl font-semibold text-slate-950">{count}</p>
                    <h3 className="text-base font-semibold text-slate-900">{title}</h3>
                    <p className="text-sm leading-6 text-slate-600">{description}</p>
                </div>
            </div>
        </AppCard>
    );
}

export function DashboardAlertCard({ href, ...props }: DashboardAlertCardProps) {
    const card = <AlertCardBody {...props} />;

    return (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, ease: 'easeOut' }} className="h-full">
            {href ? (
                <AppLink href={href} className="block h-full">
                    {card}
                </AppLink>
            ) : (
                card
            )}
        </motion.div>
    );
}
