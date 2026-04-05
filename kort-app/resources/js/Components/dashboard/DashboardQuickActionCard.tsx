import { motion } from 'framer-motion';
import { ArrowRight, type LucideIcon } from 'lucide-react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard } from '@/Components/data-display/AppCard';
import { AppLink } from '@/Components/ui/AppLink';

export interface DashboardQuickActionCardProps {
    title: string;
    description?: string;
    href: string;
    icon: LucideIcon;
}

export function DashboardQuickActionCard({ title, description, href, icon: Icon }: DashboardQuickActionCardProps) {
    return (
        <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.995 }} transition={{ duration: 0.18, ease: 'easeOut' }} className="h-full">
            <AppLink href={href} className="block h-full">
                <AppCard className="h-full border-slate-200/80 transition hover:border-blue-200 hover:shadow-panel">
                    <div className="flex h-full flex-col gap-4 p-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="rounded-2xl bg-blue-50 p-3 text-blue-700 ring-1 ring-blue-100">
                                <Icon className="h-5 w-5" />
                            </div>
                            <ArrowRight className="h-4 w-4 text-slate-300" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                            {description ? <p className="text-sm leading-6 text-slate-600">{description}</p> : null}
                        </div>
                        <div className="mt-auto">
                            <AppBadge variant="primary">Open</AppBadge>
                        </div>
                    </div>
                </AppCard>
            </AppLink>
        </motion.div>
    );
}
