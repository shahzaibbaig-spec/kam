import { forwardRef, type HTMLAttributes } from 'react';

import { cn } from '@/Lib/utils';

export const AppCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('app-surface', className)} {...props} />
));

AppCard.displayName = 'AppCard';

export const AppCardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />,
);

AppCardHeader.displayName = 'AppCardHeader';

export const AppCardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3 ref={ref} className={cn('text-lg font-semibold tracking-tight text-slate-950', className)} {...props} />
    ),
);

AppCardTitle.displayName = 'AppCardTitle';

export const AppCardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
    ({ className, ...props }, ref) => <p ref={ref} className={cn('text-sm text-slate-600', className)} {...props} />,
);

AppCardDescription.displayName = 'AppCardDescription';

export const AppCardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => <div ref={ref} className={cn('px-6 pb-6', className)} {...props} />,
);

AppCardContent.displayName = 'AppCardContent';

export const AppCardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex items-center gap-3 border-t border-slate-100 px-6 py-4', className)} {...props} />
    ),
);

AppCardFooter.displayName = 'AppCardFooter';
