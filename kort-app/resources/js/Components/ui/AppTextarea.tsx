import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/Lib/utils';

export interface AppTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const AppTextarea = forwardRef<HTMLTextAreaElement, AppTextareaProps>(({ className, ...props }, ref) => (
    <textarea
        ref={ref}
        className={cn(
            'app-focus-ring flex min-h-[120px] w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100',
            className,
        )}
        {...props}
    />
));

AppTextarea.displayName = 'AppTextarea';
