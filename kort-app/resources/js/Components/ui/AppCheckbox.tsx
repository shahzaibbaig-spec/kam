import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import { cn } from '@/Lib/utils';

export interface AppCheckboxProps extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {}

export const AppCheckbox = forwardRef<HTMLButtonElement, AppCheckboxProps>(({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
            'app-focus-ring h-5 w-5 rounded-md border border-slate-300 bg-white text-primary shadow-sm data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-white',
            className,
        )}
        {...props}
    >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center">
            <Check className="h-3.5 w-3.5" />
        </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
));

AppCheckbox.displayName = 'AppCheckbox';
