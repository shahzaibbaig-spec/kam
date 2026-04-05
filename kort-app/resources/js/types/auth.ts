export interface LoginPageProps {
    canResetPassword?: boolean;
    status?: string | null;
}

export interface ForgotPasswordPageProps {
    status?: string | null;
}

export interface ResetPasswordPageProps {
    email: string;
    token: string;
}

export interface VerifyEmailPageProps {
    status?: string | null;
}

export interface ConfirmPasswordPageProps {}
