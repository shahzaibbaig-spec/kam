import { useEffect } from 'react';

import { AuthCard } from '@/Components/auth/AuthCard';
import { AuthFooterLinks } from '@/Components/auth/AuthFooterLinks';
import { AuthHeader } from '@/Components/auth/AuthHeader';
import { PasswordField } from '@/Components/auth/PasswordField';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AuthLayout } from '@/Layouts/AuthLayout';
import type { ResetPasswordPageProps } from '@/types/auth';

export default function ResetPasswordPage({ email, token }: ResetPasswordPageProps) {
    const form = useInertiaForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        form.setValues({
            token,
            email,
        });
    }, [email, token]);

    return (
        <AuthLayout>
            <div className="space-y-6">
                <AuthHeader
                    eyebrow="Set A New Password"
                    title="Create a secure password"
                    description="Choose a new password for your KORT Assest Managment System account and return to your operational dashboard."
                />

                <AuthCard>
                    <form
                        className="space-y-5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post(route('password.store'), {
                                onFinish: () => form.reset('password', 'password_confirmation'),
                            });
                        }}
                    >
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                Email
                            </label>
                            <AppInput
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="username"
                                required
                                autoFocus
                                value={form.data.email}
                                onChange={(event) => form.setData('email', event.target.value)}
                            />
                            {form.errors.email ? <p className="text-sm text-rose-600">{form.errors.email}</p> : null}
                        </div>

                        <PasswordField
                            id="password"
                            name="password"
                            label="New password"
                            autoComplete="new-password"
                            required
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                            error={form.errors.password}
                        />

                        <PasswordField
                            id="password_confirmation"
                            name="password_confirmation"
                            label="Confirm password"
                            autoComplete="new-password"
                            required
                            value={form.data.password_confirmation}
                            onChange={(event) => form.setData('password_confirmation', event.target.value)}
                            error={form.errors.password_confirmation}
                        />

                        <AppButton type="submit" loading={form.processing} className="w-full">
                            Reset password
                        </AppButton>
                    </form>

                    <div className="mt-6">
                        <AuthFooterLinks items={[{ label: 'Back to login', href: route('login') }]} />
                    </div>
                </AuthCard>
            </div>
        </AuthLayout>
    );
}
