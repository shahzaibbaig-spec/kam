import { MailCheck } from 'lucide-react';

import { AuthCard } from '@/Components/auth/AuthCard';
import { AuthFooterLinks } from '@/Components/auth/AuthFooterLinks';
import { AuthHeader } from '@/Components/auth/AuthHeader';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AuthLayout } from '@/Layouts/AuthLayout';
import type { ForgotPasswordPageProps } from '@/types/auth';

export default function ForgotPasswordPage({ status }: ForgotPasswordPageProps) {
    const form = useInertiaForm({
        email: '',
    });

    return (
        <AuthLayout>
            <div className="space-y-6">
                <AuthHeader
                    eyebrow="Password Support"
                    title="Reset your access"
                    description="Enter your account email and we will send a secure reset link so you can return to hospital operations quickly."
                />

                <AuthCard>
                    <div className="space-y-6">
                        {status ? <AppAlert variant="success" title="Reset link sent" description={status} /> : null}

                        <form
                            className="space-y-5"
                            onSubmit={(event) => {
                                event.preventDefault();
                                form.post(route('password.email'));
                            }}
                        >
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                    Email
                                </label>
                                <div className="relative">
                                    <MailCheck className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <AppInput
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="username"
                                        autoFocus
                                        required
                                        value={form.data.email}
                                        onChange={(event) => form.setData('email', event.target.value)}
                                        className="pl-11"
                                    />
                                </div>
                                {form.errors.email ? <p className="text-sm text-rose-600">{form.errors.email}</p> : null}
                            </div>

                            <AppButton type="submit" loading={form.processing} className="w-full">
                                Email password reset link
                            </AppButton>
                        </form>

                        <AuthFooterLinks items={[{ label: 'Back to login', href: route('login') }]} />
                    </div>
                </AuthCard>
            </div>
        </AuthLayout>
    );
}
