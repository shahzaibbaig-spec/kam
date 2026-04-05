import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { LoaderCircle } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/Lib/utils';

const appButtonVariants = cva(
    'app-focus-ring inline-flex items-center justify-center gap-2 rounded-2xl text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-60',
    {
        variants: {
            variant: {
                primary: 'bg-primary text-primary-foreground shadow-panel hover:bg-blue-600',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-slate-200',
                outline: 'border border-border bg-white text-slate-700 hover:bg-slate-50',
                ghost: 'text-slate-700 hover:bg-slate-100',
                soft: 'bg-primary-soft text-blue-700 hover:bg-blue-100',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-rose-600',
                link: 'h-auto rounded-none px-0 py-0 text-primary underline-offset-4 hover:underline',
            },
            size: {
                sm: 'h-9 px-3.5',
                md: 'h-11 px-4',
                lg: 'h-12 px-5',
                icon: 'h-11 w-11',
            },
        },
        defaultVariants: {
            variant: 'primary',
            size: 'md',
        },
    },
);

export interface AppButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
        VariantProps<typeof appButtonVariants> {
    asChild?: boolean;
    loading?: boolean;
}

export const AppButton = forwardRef<HTMLButtonElement, AppButtonProps>(
    ({ asChild = false, className, variant, size, loading = false, children, disabled, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';
        const classes = cn(appButtonVariants({ variant, size }), className);

        if (asChild) {
            return (
                <Comp
                    ref={ref}
                    className={classes}
                    aria-disabled={disabled || loading || undefined}
                    data-disabled={disabled || loading ? '' : undefined}
                    {...props}
                >
                    {children}
                </Comp>
            );
        }

        return (
            <Comp
                ref={ref}
                className={classes}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                {children}
            </Comp>
        );
    },
);

AppButton.displayName = 'AppButton';

export { appButtonVariants };
