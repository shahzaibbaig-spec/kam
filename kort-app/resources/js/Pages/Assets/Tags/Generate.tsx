import { ShieldAlert, Tags } from 'lucide-react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppBadge } from '@/Components/data-display/AppBadge';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { AssetSummaryCard } from '@/Components/domain/assets/AssetCards';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppCheckbox } from '@/Components/ui/AppCheckbox';
import { AppLink } from '@/Components/ui/AppLink';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { AppLayout } from '@/Layouts/AppLayout';
import type { AssetTagGeneratePageProps } from '@/types/assets';

export default function AssetTagGeneratePage() {
    const { props } = useReactPage<AssetTagGeneratePageProps>();
    const asset = props.asset;
    const assetWithLegacyId = asset as { asset_id?: number | null };
    const assetId =
        typeof asset.id === 'number'
            ? asset.id
            : typeof assetWithLegacyId.asset_id === 'number'
              ? assetWithLegacyId.asset_id
              : null;
    const form = useInertiaForm<{ force: boolean }>({
        force: false,
    });

    const submit = () => {
        if (assetId === null) {
            return;
        }

        form.post(route('assets.tags.store', assetId));
    };

    return (
        <AppLayout
            breadcrumbs={[
                { label: 'Assets', href: route('assets.index') },
                { label: asset.asset_name, href: assetId !== null ? route('assets.show', assetId) : route('assets.index') },
                { label: 'Generate Tag' },
            ]}
        >
            <div className="space-y-6">
                <PageHeader
                    title="Generate Asset Tag"
                    description="Produce a barcode and QR-ready tag using the hospital’s standard asset format."
                    actions={
                        <>
                            <AppButton asChild variant="outline">
                                <AppLink href={assetId !== null ? route('assets.show', assetId) : route('assets.index')}>Back to asset</AppLink>
                            </AppButton>
                            <AppButton type="button" onClick={submit} loading={form.processing} disabled={assetId === null}>
                                <Tags className="h-4 w-4" />
                                {form.data.force ? 'Generate replacement tag' : 'Generate tag'}
                            </AppButton>
                        </>
                    }
                />

                {assetId === null ? (
                    <AppAlert
                        variant="danger"
                        title="Asset identifier is missing"
                        description="This record is missing its internal identifier, so tag generation cannot continue from this page."
                    />
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
                    <AssetSummaryCard
                        asset={asset}
                        title="Asset summary"
                        description="Review the asset identity before generating or replacing the active tag."
                    />

                    <AppCard className="border-blue-100">
                        <AppCardHeader className="border-b border-slate-100">
                            <AppCardTitle>Tag generation</AppCardTitle>
                            <AppCardDescription>Preview the next tag value and confirm whether the current active tag should be replaced.</AppCardDescription>
                        </AppCardHeader>
                        <AppCardContent className="space-y-5 p-6">
                            <div className="rounded-3xl border border-slate-100 bg-slate-50/80 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Current active tag</p>
                                <p className="mt-2 text-lg font-semibold text-slate-950">{asset.tag_number ?? 'No active tag'}</p>
                            </div>

                            <div className="rounded-3xl border border-blue-100 bg-blue-50/70 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">Generated preview</p>
                                        <p className="mt-2 text-lg font-semibold text-slate-950">{props.previewTag}</p>
                                    </div>
                                    <AppBadge variant="primary">Next available</AppBadge>
                                </div>
                            </div>

                            {asset.tag_number && props.canRegenerate ? (
                                <label className="flex items-start gap-3 rounded-3xl border border-slate-100 bg-white p-4">
                                    <AppCheckbox checked={form.data.force} onCheckedChange={(checked) => form.setData('force', checked === true)} />
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Retire the current tag and generate a replacement</p>
                                        <p className="mt-1 text-sm text-slate-600">Use this when the tag is damaged, lost, or must be replaced operationally.</p>
                                    </div>
                                </label>
                            ) : null}

                            {asset.tag_number && !props.canRegenerate ? (
                                <AppAlert
                                    variant="warning"
                                    title="A tag already exists"
                                    description="You can review or print the current label, but your current role cannot replace the active tag."
                                />
                            ) : null}

                            {form.errors.tag_number ? (
                                <AppAlert variant="danger" title="Tag generation blocked" description={form.errors.tag_number} />
                            ) : null}

                            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/80 p-4">
                                <div className="flex items-start gap-3">
                                    <div className="rounded-2xl bg-warning-soft p-3 text-amber-700">
                                        <ShieldAlert className="h-5 w-5" />
                                    </div>
                                    <div className="text-sm text-slate-600">
                                        <p className="font-semibold text-slate-900">Practical guidance</p>
                                        <p className="mt-1">
                                            Generate a replacement only when the current active tag should be retired. This keeps print history and traceability cleaner.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </AppCardContent>
                    </AppCard>
                </div>
            </div>
        </AppLayout>
    );
}
