import { AuthCard } from '@/Components/auth/AuthCard';
import { AuthFooterLinks } from '@/Components/auth/AuthFooterLinks';
import { AuthHeader } from '@/Components/auth/AuthHeader';
import { PasswordField } from '@/Components/auth/PasswordField';
import { AppButton } from '@/Components/ui/AppButton';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AuthLayout } from '@/Layouts/AuthLayout';

export default function ConfirmPasswordPage() {
    const form = useInertiaForm({
        password: '',
    });

    return (
        <AuthLayout>
            <div className="space-y-6">
                <AuthHeader
                    eyebrow="Secure Confirmation"
                    title="Confirm your password"
                    description="This protected area needs one more password confirmation before continuing with sensitive actions."
                />

                <AuthCard>
                    <form
                        className="space-y-5"
                        onSubmit={(event) => {
                            event.preventDefault();
                            form.post(route('password.confirm'), {
                                onFinish: () => form.reset(),
                            });
                        }}
                    >
                        <PasswordField
                            id="password"
                            name="password"
                            label="Password"
                            autoComplete="current-password"
                            autoFocus
                            required
                            value={form.data.password}
                            onChange={(event) => form.setData('password', event.target.value)}
                            error={form.errors.password}
                        />

                        <AppButton type="submit" loading={form.processing} className="w-full">
                            Confirm password
                        </AppButton>
                    </form>

                    <div className="mt-6">
                        <AuthFooterLinks items={[{ label: 'Back to dashboard', href: route('dashboard') }]} />
                    </div>
                </AuthCard>
            </div>
        </AuthLayout>
    );
}
