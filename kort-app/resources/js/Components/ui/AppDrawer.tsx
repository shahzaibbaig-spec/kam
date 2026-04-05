import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { type ReactNode } from 'react';

import { AppButton } from '@/Components/ui/AppButton';
import { cn } from '@/Lib/utils';

export interface AppDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    side?: 'left' | 'right';
    widthClassName?: string;
}

export function AppDrawer({
    open,
    onOpenChange,
    title,
    description,
    children,
    side = 'right',
    widthClassName = 'w-full max-w-xl',
}: AppDrawerProps) {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {open ? (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                className="fixed inset-0 z-50 bg-slate-950/25 backdrop-blur-sm"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, x: side === 'right' ? 24 : -24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: side === 'right' ? 24 : -24 }}
                                transition={{ duration: 0.18, ease: 'easeOut' }}
                                className={cn(
                                    'fixed bottom-0 top-0 z-50 flex bg-white shadow-surface',
                                    side === 'right' ? 'right-0' : 'left-0',
                                    widthClassName,
                                )}
                            >
                                <div className="flex h-full w-full flex-col">
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
                                            <AppButton variant="ghost" size="icon" aria-label="Close drawer">
                                                <X className="h-4 w-4" />
                                            </AppButton>
                                        </Dialog.Close>
                                    </div>
                                    <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                ) : null}
            </AnimatePresence>
        </Dialog.Root>
    );
}
