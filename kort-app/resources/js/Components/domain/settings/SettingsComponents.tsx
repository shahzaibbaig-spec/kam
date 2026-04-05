import { Bell, Boxes, Hospital, PackageSearch, Palette, type LucideIcon, Settings2, ShieldCheck, Tags, Wrench } from 'lucide-react';
import { type ReactNode } from 'react';

import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { AppButton } from '@/Components/ui/AppButton';
import { AppCheckbox } from '@/Components/ui/AppCheckbox';
import { AppLink } from '@/Components/ui/AppLink';
import { cn, formatTitleCase } from '@/Lib/utils';
import type { LabelSettingsModel, SettingsNavigationItem } from '@/types/settings';

const settingsIconMap: Record<string, LucideIcon> = {
    general: Hospital,
    labels: Tags,
    notifications: Bell,
    inventory: Boxes,
    maintenance: Wrench,
    appearance: Palette,
    security: ShieldCheck,
};

function iconFor(key: string) {
    return settingsIconMap[key] ?? Settings2;
}

export function SettingsSectionCard({
    title,
    description,
    children,
    className,
}: {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <AppCard className={className}>
            <AppCardHeader>
                <AppCardTitle>{title}</AppCardTitle>
                {description ? <AppCardDescription>{description}</AppCardDescription> : null}
            </AppCardHeader>
            <AppCardContent>{children}</AppCardContent>
        </AppCard>
    );
}

export function SettingsNavGrid({
    items,
    currentRouteName,
}: {
    items: SettingsNavigationItem[];
    currentRouteName?: string;
}) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
                const Icon = iconFor(item.key);
                const active = currentRouteName === item.route;

                return (
                    <AppLink
                        key={item.key}
                        href={route(item.route)}
                        className={cn(
                            'group rounded-[1.75rem] border p-5 transition',
                            active
                                ? 'border-blue-200 bg-blue-50/60 shadow-panel'
                                : 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/40',
                        )}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div className="rounded-2xl bg-primary-soft p-3 text-blue-700">
                                <Icon className="h-5 w-5" />
                            </div>
                            {active ? <AppBadge variant="primary">Current</AppBadge> : null}
                        </div>
                        <div className="mt-4">
                            <p className="font-semibold text-slate-950">{item.title}</p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                        </div>
                    </AppLink>
                );
            })}
        </div>
    );
}

export function SettingsSidebarNav({
    items,
    currentRouteName,
}: {
    items: SettingsNavigationItem[];
    currentRouteName?: string;
}) {
    return (
        <SettingsSectionCard title="Settings Navigation" description="Role-aware navigation for the configuration areas available to this user.">
            <div className="space-y-2">
                {items.map((item) => {
                    const Icon = iconFor(item.key);
                    const active = currentRouteName === item.route;

                    return (
                        <AppLink
                            key={item.key}
                            href={route(item.route)}
                            className={cn(
                                'flex items-start gap-3 rounded-2xl px-4 py-3 transition',
                                active ? 'bg-blue-50 text-blue-800 ring-1 ring-blue-200' : 'bg-slate-50/70 text-slate-700 hover:bg-blue-50/50',
                            )}
                        >
                            <div className="rounded-xl bg-white p-2 text-blue-700 ring-1 ring-slate-200">
                                <Icon className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium">{item.title}</p>
                                <p className="mt-1 text-sm leading-5 text-slate-500">{item.description}</p>
                            </div>
                        </AppLink>
                    );
                })}
            </div>
        </SettingsSectionCard>
    );
}

export function SettingsFormSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <SettingsSectionCard title={title} description={description}>
            <div className="grid gap-5">{children}</div>
        </SettingsSectionCard>
    );
}

export function SettingsField({
    label,
    error,
    hint,
    required,
    children,
    className,
}: {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <label className="mb-2 block text-sm font-medium text-slate-700">
                {label}
                {required ? <span className="ml-1 text-rose-600">*</span> : null}
            </label>
            {children}
            {hint ? <p className="mt-2 text-xs leading-5 text-slate-500">{hint}</p> : null}
            {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
        </div>
    );
}

export function SettingsBooleanField({
    label,
    description,
    checked,
    disabled,
    onCheckedChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    disabled?: boolean;
    onCheckedChange: (checked: boolean) => void;
}) {
    return (
        <div className="flex items-start justify-between gap-4 rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
            <div>
                <p className="font-medium text-slate-900">{label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
            </div>
            <AppCheckbox checked={checked} disabled={disabled} onCheckedChange={(value) => onCheckedChange(value === true)} />
        </div>
    );
}

export function SettingsSaveBar({
    dirtyLabel = 'Changes are ready to save',
    disabled,
    loading,
    actionLabel = 'Save Changes',
    onSave,
}: {
    dirtyLabel?: string;
    disabled?: boolean;
    loading?: boolean;
    actionLabel?: string;
    onSave?: () => void;
}) {
    return (
        <div className="sticky bottom-4 z-20 rounded-[1.75rem] border border-slate-200 bg-white/95 px-4 py-4 shadow-panel backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p className="font-semibold text-slate-900">{dirtyLabel}</p>
                    <p className="mt-1 text-sm text-slate-600">Review the form sections and save when the configuration looks right.</p>
                </div>
                <AppButton type="submit" disabled={disabled} loading={loading} onClick={onSave}>
                    {actionLabel}
                </AppButton>
            </div>
        </div>
    );
}

export function LabelPreviewSettingsCard({ settings }: { settings: LabelSettingsModel }) {
    return (
        <SettingsSectionCard title="Sample Label Preview" description="A compact preview of how asset labels will render with the current display options.">
            <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-5">
                <div className="mx-auto max-w-xs rounded-3xl border border-slate-300 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-slate-950">Ventilator Monitor</p>
                            <p className="mt-1 text-xs text-slate-500">{settings.asset_tag_pattern || 'KORT-{YYYY}-{####}'}</p>
                        </div>
                        <AppBadge variant="outline">{settings.label_size}</AppBadge>
                    </div>
                    <div className="mt-4 space-y-2">
                        {settings.barcode_enabled ? <div className="h-9 rounded-xl bg-slate-900/90" /> : null}
                        {settings.qr_enabled ? <div className="h-14 w-14 rounded-xl bg-slate-900/90" /> : null}
                    </div>
                    <div className="mt-4 space-y-1 text-xs text-slate-600">
                        {settings.include_department ? <p>Department: ICU</p> : null}
                        {settings.include_location ? <p>Location: Biomedical Store</p> : null}
                        <p>{settings.label_footer || 'Hospital asset label'}</p>
                    </div>
                </div>
            </div>
        </SettingsSectionCard>
    );
}

export function SettingsSummaryBadge({ label, value }: { label: string; value: number | string }) {
    return (
        <div className="rounded-3xl border border-slate-100 bg-slate-50/70 px-4 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold text-slate-950">{formatTitleCase(value)}</p>
        </div>
    );
}

export function SettingsPlaceholderCard() {
    return (
        <SettingsSectionCard
            title="Placeholder-ready configuration"
            description="This area is designed so future organization, appearance, or permission-reference settings can slot in without changing the overall UI pattern."
        >
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-4 py-4 text-sm leading-6 text-slate-600">
                Additional optional settings modules can be introduced here when the backend is ready, without disrupting the current settings workflow.
            </div>
        </SettingsSectionCard>
    );
}
