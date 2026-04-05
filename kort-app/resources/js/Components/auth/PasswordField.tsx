import { Eye, EyeOff } from 'lucide-react';
import { useState, type InputHTMLAttributes } from 'react';

import { AppButton } from '@/Components/ui/AppButton';
import { AppInput } from '@/Components/ui/AppInput';
import { cn } from '@/Lib/utils';

export interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
    error?: string;
    hint?: string;
    containerClassName?: string;
}

export function PasswordField({
    label,
    error,
    hint,
    className,
    containerClassName,
    ...props
}: PasswordFieldProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className={cn('space-y-2', containerClassName)}>
            <label htmlFor={props.id} className="text-sm font-medium text-slate-700">
                {label}
            </label>
            <div className="relative">
                <AppInput
                    {...props}
                    type={visible ? 'text' : 'password'}
                    className={cn('pr-14', error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : '', className)}
                />
                <AppButton
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                    onClick={() => setVisible((current) => !current)}
                >
                    {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span className="sr-only">{visible ? 'Hide password' : 'Show password'}</span>
                </AppButton>
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            {!error && hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
        </div>
    );
}
