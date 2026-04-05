import { AppSkeleton } from '@/Components/data-display/AppSkeleton';

export interface AppTableSkeletonProps {
    rows?: number;
    columns?: number;
}

export function AppTableSkeleton({ rows = 5, columns = 6 }: AppTableSkeletonProps) {
    return (
        <div className="overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
                <AppSkeleton className="h-4 w-56" />
            </div>
            <div className="space-y-4 p-6">
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <div key={rowIndex} className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
                        {Array.from({ length: columns }).map((__, columnIndex) => (
                            <AppSkeleton key={`${rowIndex}-${columnIndex}`} className="h-9 w-full" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}
