import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { type ReactNode } from 'react';

import { AppButton } from '@/Components/ui/AppButton';
import { cn } from '@/Lib/utils';

export interface AppModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    footer?: ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
};

export function AppModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    footer,
    size = 'md',
}: AppModalProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open ? (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                className="fixed inset-0 z-50 bg-slate-950/35 backdrop-blur-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className="fixed inset-0 z-50 grid place-items-center p-4"
                            >
                                <div className={cn('w-full rounded-[1.75rem] border border-white/90 bg-white shadow-surface', sizeClasses[size])}>
                                    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
                                        <div>
                                            <Dialog.Title className="text-lg font-semibold text-slate-950">{title}</Dialog.Title>
                                            {description ? (
                                                <Dialog.Description className="mt-1 text-sm text-slate-600">
                                                    {description}
                                                </Dialog.Description>
                                            ) : null}
                                        </div>
                                        <Dialog.Close asChild>
                                            <AppButton variant="ghost" size="icon" aria-label="Close modal">
                                                <X className="h-4 w-4" />
                                            </AppButton>
                                        </Dialog.Close>
                                    </div>
                                    <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
                                    {footer ? <div className="border-t border-slate-100 px-6 py-4">{footer}</div> : null}
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                ) : null}
            </AnimatePresence>
        </Dialog.Root>
    );
}
