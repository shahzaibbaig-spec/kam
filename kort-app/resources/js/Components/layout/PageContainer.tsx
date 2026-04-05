import { motion } from 'framer-motion';
import { type ReactNode } from 'react';

import { cn } from '@/Lib/utils';

export interface PageContainerProps {
    children: ReactNode;
    className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
    return (
        <motion.main
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={cn('space-y-6', className)}
        >
            {children}
        </motion.main>
    );
}
