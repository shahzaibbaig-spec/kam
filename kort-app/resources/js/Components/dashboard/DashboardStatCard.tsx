import { motion } from 'framer-motion';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard } from '@/Components/data-display/AppCard';
import { AppLink } from '@/Components/ui/AppLink';
import { cn } from '@/Lib/utils';

export interface DashboardStatCardProps {
    label: string;
    value: number | string;
    description?: string;
    href?: string | null;
    icon?: LucideIcon;
    tone?: 'primary' | 'success' | 'warning' | 'info';
}

const toneClasses: Record<NonNullable<DashboardStatCardProps['tone']>, string> = {
    primary: 'bg-blue-50 text-blue-700 ring-blue-200',
    success: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-50 text-amber-800 ring-amber-200',
    info: 'bg-sky-50 text-sky-700 ring-sky-200',
};

function StatCardBody({ label, value, description, icon: Icon = ArrowUpRight, tone = 'primary' }: Omit<DashboardStatCardProps, 'href'>) {
    return (
        <AppCard className="h-full overflow-hidden">
            <div className="flex h-full flex-col gap-5 p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-500">{label}</p>
                        <p className="text-3xl font-semibold text-slate-950">{value}</p>
                    </div>
                    <div className={cn('rounded-2xl p-2 ring-1', toneClasses[tone])}>
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                {description ? (
                    <div className="mt-auto">
                        <AppBadge variant="outline" className="bg-white">
                            {description}
                        </AppBadge>
                    </div>
                ) : null}
            </div>
        </AppCard>
    );
}

export function DashboardStatCard({ href, ...props }: DashboardStatCardProps) {
    const card = <StatCardBody {...props} />;

    return (
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18, ease: 'easeOut' }} className="h-full">
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
