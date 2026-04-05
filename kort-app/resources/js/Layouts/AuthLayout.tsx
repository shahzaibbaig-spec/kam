import { motion } from 'framer-motion';
import { LockKeyhole, ShieldCheck, Stethoscope } from 'lucide-react';
import { type ReactNode } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppLink } from '@/Components/ui/AppLink';
import type { ReactSharedPageProps } from '@/types/app-shell';
import { getInitials } from '@/Lib/utils';

export interface AuthLayoutProps {
    children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
    const page = useReactPage<ReactSharedPageProps>();

    return (
        <div className="min-h-screen bg-app-glow px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                <motion.section
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="relative overflow-hidden rounded-[2rem] bg-sidebar px-8 py-8 text-white shadow-panel"
                >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.35),_transparent_36%)]" />
                    <div className="relative flex h-full flex-col">
                        <AppLink href="/" className="flex items-center gap-3">
                            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/12 text-sm font-semibold ring-1 ring-white/15">
                                {getInitials(page.props.app?.name)}
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-200">Hospital Operations</p>
                                <p className="text-sm font-semibold text-white">{page.props.app?.name ?? 'KORT Assest Managment System'}</p>
                            </div>
                        </AppLink>

                        <div className="mt-10 space-y-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-200">Secure Access</p>
                            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white">
                                A calm, modern workspace for hospital asset accountability and inventory control.
                            </h1>
                            <p className="max-w-2xl text-sm leading-7 text-blue-100/90">
                                Designed for clinical operations teams who need clarity, speed, and dependable audit visibility without unnecessary visual noise.
                            </p>
                        </div>

                        <div className="mt-10 grid gap-4 sm:grid-cols-3">
                            <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
                                <ShieldCheck className="h-5 w-5 text-blue-200" />
                                <p className="mt-4 text-sm font-semibold text-white">Permission Aware</p>
                                <p className="mt-2 text-sm text-blue-100/80">Role-based visibility stays controlled by Laravel.</p>
                            </div>
                            <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
                                <Stethoscope className="h-5 w-5 text-blue-200" />
                                <p className="mt-4 text-sm font-semibold text-white">Clinical Fit</p>
                                <p className="mt-2 text-sm text-blue-100/80">Professional visuals suited to hospital operations.</p>
                            </div>
                            <div className="rounded-3xl bg-white/10 p-4 ring-1 ring-white/10">
                                <LockKeyhole className="h-5 w-5 text-blue-200" />
                                <p className="mt-4 text-sm font-semibold text-white">Audit Ready</p>
                                <p className="mt-2 text-sm text-blue-100/80">Structured for traceability and secure daily usage.</p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <motion.section
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.28, ease: 'easeOut', delay: 0.04 }}
                    className="flex items-center"
                >
                    <div className="w-full rounded-[2rem] border border-white/90 bg-white/95 p-6 shadow-surface sm:p-8 lg:p-10">
                        {children}
                    </div>
                </motion.section>
            </div>
        </div>
    );
}
