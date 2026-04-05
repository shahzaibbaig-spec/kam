import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/Lib/utils';

export interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(({ className, type = 'text', ...props }, ref) => (
    <input
        ref={ref}
        type={type}
        className={cn(
            'app-focus-ring flex h-11 w-full rounded-2xl border border-input bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
            className,
        )}
        {...props}
    />
));

AppInput.displayName = 'AppInput';
