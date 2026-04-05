import { Activity, Boxes, ShieldCheck, Stethoscope } from 'lucide-react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppButton } from '@/Components/ui/AppButton';
import { AppEmptyState } from '@/Components/data-display/AppEmptyState';
import { AppStatCard } from '@/Components/data-display/AppStatCard';
import { AppTableShell } from '@/Components/data-display/AppTableShell';
import { AppFilterBar } from '@/Components/forms/AppFilterBar';
import { AppSearchInput } from '@/Components/forms/AppSearchInput';
import { PageHeader } from '@/Components/layout/PageHeader';
import { SectionHeader } from '@/Components/layout/SectionHeader';
import { AppLayout } from '@/Layouts/AppLayout';

const statCards = [
    {
        label: 'Active Assets',
        value: '1,284',
        description: 'Available, in use, or in maintenance',
        icon: Stethoscope,
        tone: 'primary' as const,
    },
    {
        label: 'Inventory Alerts',
        value: '18',
        description: 'Low stock or expiring batches',
        icon: Boxes,
        tone: 'warning' as const,
    },
    {
        label: 'Recent Audits',
        value: '42',
        description: 'Logged actions in the last 24 hours',
        icon: ShieldCheck,
        tone: 'info' as const,
    },
    {
        label: 'Open Work Orders',
        value: '9',
        description: 'Preventive or corrective maintenance',
        icon: Activity,
        tone: 'success' as const,
    },
];

export default function FoundationPreview() {
    return (
        <AppLayout breadcrumbs={[{ label: 'Phase A' }, { label: 'Foundation Preview' }]}>
            <PageHeader
                title="Foundation Preview"
                description="Reference composition for the upcoming React page migrations. This shows the Phase A shell, tokens, and reusable components working together."
                actions={
                    <>
                        <AppButton variant="soft">Secondary Action</AppButton>
                        <AppButton>Primary Action</AppButton>
                    </>
                }
                meta={
                    <div className="flex flex-wrap gap-2">
                        <AppBadge variant="primary">Blue / White Theme</AppBadge>
                        <AppBadge variant="info">Subtle Motion</AppBadge>
                        <AppBadge variant="outline">Hospital-Safe UI</AppBadge>
                    </div>
                }
            />

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {statCards.map((card) => (
                    <AppStatCard key={card.label} {...card} />
                ))}
            </section>

            <section className="app-surface p-6">
                <SectionHeader
                    title="Table And Filter Pattern"
                    description="Reusable structure for list pages like assets, inventory, suppliers, requisitions, and audit logs."
                />

                <div className="mt-5">
                    <AppTableShell
                        title="Asset Registry"
                        description="Server-driven results can drop into this shell without reworking the frame."
                        toolbar={
                            <AppFilterBar className="xl:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,1fr))_auto]">
                                <AppSearchInput placeholder="Search by asset name, code, serial, or tag" />
                                <select className="app-focus-ring h-11 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
                                    <option>Any category</option>
                                </select>
                                <select className="app-focus-ring h-11 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
                                    <option>Any department</option>
                                </select>
                                <select className="app-focus-ring h-11 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900">
                                    <option>Any status</option>
                                </select>
                                <AppButton className="w-full xl:w-auto">Apply Filters</AppButton>
                            </AppFilterBar>
                        }
                        empty
                        emptyTitle="Preview Table Shell"
                        emptyDescription="This placeholder intentionally shows the empty-state pattern used before the live React pages are migrated."
                    >
                        <AppEmptyState
                            title="No preview rows"
                            description="Phase B onward will connect this shell to actual Inertia page props and controller-driven datasets."
                        />
                    </AppTableShell>
                </div>
            </section>
        </AppLayout>
    );
}
