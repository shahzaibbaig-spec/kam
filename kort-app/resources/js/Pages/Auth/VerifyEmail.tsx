import { MailCheck } from 'lucide-react';

import { AuthCard } from '@/Components/auth/AuthCard';
import { AuthFooterLinks } from '@/Components/auth/AuthFooterLinks';
import { AuthHeader } from '@/Components/auth/AuthHeader';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppButton } from '@/Components/ui/AppButton';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AuthLayout } from '@/Layouts/AuthLayout';
import type { VerifyEmailPageProps } from '@/types/auth';

export default function VerifyEmailPage({ status }: VerifyEmailPageProps) {
    const form = useInertiaForm({});
    const verificationLinkSent = status === 'verification-link-sent';

    return (
        <AuthLayout>
            <div className="space-y-6">
                <AuthHeader
                    eyebrow="Email Verification"
                    title="Confirm your email address"
                    description="Verify your email before entering the full system so access remains secure and audit-ready for hospital administration."
                />

                <AuthCard>
                    <div className="space-y-6">
                        <AppAlert
                            variant="info"
                            title="Verification required"
                            description="We have sent a verification email to your inbox. Open it and confirm your address to continue."
                            icon={MailCheck}
                        />

                        {verificationLinkSent ? (
                            <AppAlert
                                variant="success"
                                title="Verification link sent"
                                description="A new verification link has been sent to the email address attached to your account."
                            />
                        ) : null}

                        <AppButton
                            type="button"
                            loading={form.processing}
                            onClick={() => {
                                form.post(route('verification.send'));
                            }}
                        >
                            Resend verification email
                        </AppButton>

                        <AuthFooterLinks items={[{ label: 'Log out', href: route('logout'), method: 'post' }]} />
                    </div>
                </AuthCard>
            </div>
        </AuthLayout>
    );
}
