import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

import { AppCard, AppCardContent } from '@/Components/data-display/AppCard';
import { cn } from '@/Lib/utils';

export interface AuthCardProps {
    children: ReactNode;
    className?: string;
}

export function AuthCard({ children, className }: AuthCardProps) {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
            <AppCard className={cn('overflow-hidden border border-slate-200/80 bg-slate-50/70 shadow-none', className)}>
                <AppCardContent className="p-6 sm:p-7">{children}</AppCardContent>
            </AppCard>
        </motion.div>
    );
}
