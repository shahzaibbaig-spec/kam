import { ArrowUpRight, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { cn } from '@/Lib/utils';

export interface AppStatCardProps {
    label: string;
    value: string | number;
    description?: string;
    trendLabel?: string;
    icon?: LucideIcon;
    tone?: 'primary' | 'success' | 'warning' | 'info';
    className?: string;
}

const toneClasses: Record<NonNullable<AppStatCardProps['tone']>, string> = {
    primary: 'from-blue-500/15 via-blue-100/60 to-white text-blue-700',
    success: 'from-emerald-500/15 via-emerald-100/60 to-white text-emerald-700',
    warning: 'from-amber-500/15 via-amber-100/60 to-white text-amber-700',
    info: 'from-sky-500/15 via-sky-100/60 to-white text-sky-700',
};

export function AppStatCard({
    label,
    value,
    description,
    trendLabel,
    icon: Icon = ArrowUpRight,
    tone = 'primary',
    className,
}: AppStatCardProps) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn('overflow-hidden rounded-3xl border border-white/90 bg-white shadow-surface', className)}
        >
            <div className={cn('bg-gradient-to-br p-5', toneClasses[tone])}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-sm font-medium text-slate-500">{label}</p>
                        <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
                    </div>
                    <div className="rounded-2xl bg-white/80 p-2 shadow-sm">
                        <Icon className="h-5 w-5" />
                    </div>
                </div>
                {description ? <p className="mt-4 text-sm text-slate-600">{description}</p> : null}
                {trendLabel ? (
                    <div className="mt-4">
                        <AppBadge variant="outline">{trendLabel}</AppBadge>
                    </div>
                ) : null}
            </div>
        </motion.div>
    );
}
