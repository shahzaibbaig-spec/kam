import { Mail } from 'lucide-react';

import { AuthCard } from '@/Components/auth/AuthCard';
import { AuthFooterLinks } from '@/Components/auth/AuthFooterLinks';
import { AuthHeader } from '@/Components/auth/AuthHeader';
import { PasswordField } from '@/Components/auth/PasswordField';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppCheckbox } from '@/Components/ui/AppCheckbox';
import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AuthLayout } from '@/Layouts/AuthLayout';
import type { LoginPageProps } from '@/types/auth';

function FieldError({ message }: { message?: string }) {
    return message ? <p className="text-sm text-rose-600">{message}</p> : null;
}

export default function LoginPage({ canResetPassword = false, status }: LoginPageProps) {
    const form = useInertiaForm<{ email: string; password: string; remember: boolean }>({
        email: '',
        password: '',
        remember: false,
    });

    const submit = () => {
        form.post(route('login'), {
            onFinish: () => {
                form.reset('password');
            },
        });
    };

    return (
        <AuthLayout>
            <div className="space-y-6">
                <AuthHeader
                    eyebrow="Welcome Back"
                    title="Sign in to continue"
                    description="Access KORT Asset Management System for hospital asset accountability, inventory visibility, and daily operational workflows."
                />

                <AuthCard>
                    <div className="space-y-6">
                        {status ? <AppAlert variant="success" title="Status updated" description={status} /> : null}

                        <form
                            className="space-y-5"
                            onSubmit={(event) => {
                                event.preventDefault();
                                submit();
                            }}
                        >
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-slate-700">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
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
                                <FieldError message={form.errors.email} />
                            </div>

                            <PasswordField
                                id="password"
                                name="password"
                                label="Password"
                                autoComplete="current-password"
                                required
                                value={form.data.password}
                                onChange={(event) => form.setData('password', event.target.value)}
                                error={form.errors.password}
                            />

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <label className="flex items-center gap-3 text-sm text-slate-600">
                                    <AppCheckbox
                                        checked={form.data.remember}
                                        onCheckedChange={(checked) => form.setData('remember', checked === true)}
                                    />
                                    <span>Remember me on this device</span>
                                </label>

                                {canResetPassword ? (
                                    <AuthFooterLinks items={[{ label: 'Forgot your password?', href: route('password.request') }]} />
                                ) : null}
                            </div>

                            <AppButton type="submit" loading={form.processing} className="w-full">
                                Log in
                            </AppButton>
                        </form>
                    </div>
                </AuthCard>
            </div>
        </AuthLayout>
    );
}
