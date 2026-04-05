import { Search } from 'lucide-react';
import { forwardRef, type InputHTMLAttributes } from 'react';

import { AppInput } from '@/Components/ui/AppInput';
import { cn } from '@/Lib/utils';

export interface AppSearchInputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const AppSearchInput = forwardRef<HTMLInputElement, AppSearchInputProps>(({ className, ...props }, ref) => (
    <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <AppInput ref={ref} className={cn('pl-10', className)} type="search" {...props} />
    </div>
));

AppSearchInput.displayName = 'AppSearchInput';
