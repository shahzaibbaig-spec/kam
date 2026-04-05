import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';

export interface DashboardSectionProps {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export function DashboardSection({ title, description, action, children, className }: DashboardSectionProps) {
    return (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            <AppCard className={className}>
                <AppCardHeader className="gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-1">
                        <AppCardTitle>{title}</AppCardTitle>
                        {description ? <AppCardDescription>{description}</AppCardDescription> : null}
                    </div>
                    {action ? <div className="shrink-0">{action}</div> : null}
                </AppCardHeader>
                <AppCardContent className="pt-6">{children}</AppCardContent>
            </AppCard>
        </motion.section>
    );
}
