import { router } from '@inertiajs/vue3';
import { ImagePlus, Save } from 'lucide-react';
import { useEffect, useState } from 'react';

import { useReactPage } from '@/Bridge/ReactPageContext';
import { AppAlert } from '@/Components/data-display/AppAlert';
import { AppCard, AppCardContent, AppCardDescription, AppCardHeader, AppCardTitle } from '@/Components/data-display/AppCard';
import { PageHeader } from '@/Components/layout/PageHeader';
import { AppButton } from '@/Components/ui/AppButton';
import { AppDateField } from '@/Components/ui/AppDateField';
import { AppInput } from '@/Components/ui/AppInput';
import { AppLink } from '@/Components/ui/AppLink';
import { AppSelect } from '@/Components/ui/AppSelect';
import { AppTextarea } from '@/Components/ui/AppTextarea';
import { AppLayout } from '@/Layouts/AppLayout';
import type { AssetFormData, AssetFormPageProps, AssetOptionRecord } from '@/types/assets';

function normalizeValue(value: string | number | null | undefined) {
    return value === null || value === undefined ? '' : String(value);
}

function resolveAssetId(asset: AssetFormPageProps['asset']): number | null {
    if (asset === null) {
        return null;
    }

    if (typeof asset.id === 'number') {
        return asset.id;
    }

    const legacyAsset = asset as { asset_id?: number | null };

    return typeof legacyAsset.asset_id === 'number' ? legacyAsset.asset_id : null;
}

function buildFormData(page: AssetFormPageProps['asset']): AssetFormData {
    return {
        asset_name: page?.asset_name ?? '',
        asset_code: page?.asset_code ?? '',
        asset_category_id: normalizeValue(page?.asset_category_id),
        supplier_id: normalizeValue(page?.supplier_id),
        department_id: normalizeValue(page?.department_id),
        location_id: normalizeValue(page?.location_id),
        room_or_area: page?.room_or_area ?? '',
        assigned_user_id: normalizeValue(page?.assigned_user_id),
        assigned_department_id: normalizeValue(page?.assigned_department_id),
        assigned_location_id: normalizeValue(page?.assigned_location_id),
        custodian_name: page?.custodian_name ?? '',
        brand: page?.brand ?? '',
        model: page?.model ?? '',
        serial_number: page?.serial_number ?? '',
        manufacturer: page?.manufacturer ?? '',
        purchase_date: page?.purchase_date ?? '',
        warranty_start: page?.warranty_start ?? '',
        warranty_end: page?.warranty_end ?? '',
        purchase_cost: normalizeValue(page?.purchase_cost),
        depreciation_method: page?.depreciation_method ?? '',
        useful_life_years: normalizeValue(page?.useful_life_years),
        residual_value: normalizeValue(page?.residual_value),
        condition_status: page?.condition_status ?? 'good',
        asset_status: page?.asset_status ?? 'available',
        notes: page?.notes ?? '',
        image: null,
    };
}

function renderOptions(records: AssetOptionRecord[]) {
    return records.map((record) => {
        const value = record.id ?? record.value ?? '';
        const label = record.name ?? record.label ?? '';

        return (
            <option key={`${value}-${label}`} value={value}>
                {label}
            </option>
        );
    });
}

function FieldError({ message }: { message?: string }) {
    return message ? <p className="text-sm text-rose-600">{message}</p> : null;
}

function FieldLabel({ children, hint }: { children: string; hint?: string }) {
    return (
        <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">{children}</label>
            {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
        </div>
    );
}

export default function AssetFormPage() {
    const { props } = useReactPage<AssetFormPageProps>();
    const asset = props.asset;
    const assetId = resolveAssetId(asset);
    const [data, setData] = useState<AssetFormData>(() => buildFormData(asset));
    const [processing, setProcessing] = useState(false);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(asset?.image_url ?? null);

    useEffect(() => {
        if (!data.image) {
            setImagePreviewUrl(asset?.image_url ?? null);
            return;
        }

        const previewUrl = URL.createObjectURL(data.image);
        setImagePreviewUrl(previewUrl);

        return () => URL.revokeObjectURL(previewUrl);
    }, [asset?.image_url, data.image]);

    const setField = <TField extends keyof AssetFormData>(field: TField, value: AssetFormData[TField]) => {
        setData((current) => ({
            ...current,
            [field]: value,
        }));
    };

    const submit = () => {
        if (asset && assetId === null) {
            return;
        }

        const payload = asset
            ? {
                  ...data,
                  _method: 'put',
              }
            : data;

        setProcessing(true);

        router.post(asset ? route('assets.update', assetId as number) : route('assets.store'), payload, {
            forceFormData: true,
            preserveScroll: true,
            onFinish: () => setProcessing(false),
        });
    };

    return (
        <AppLayout breadcrumbs={[{ label: 'Assets', href: route('assets.index') }, { label: asset ? asset.asset_name : 'Create Asset' }]}>
            <div className="space-y-6">
                <PageHeader
                    title={asset ? 'Edit Asset' : 'Create Asset'}
                    description="Capture asset identity, placement, warranty details, and accountability data in a structured hospital-ready record."
                    actions={
                        <>
                            <AppButton asChild variant="outline">
                                <AppLink href={asset && assetId !== null ? route('assets.show', assetId) : route('assets.index')}>Cancel</AppLink>
                            </AppButton>
                            <AppButton type="button" onClick={submit} loading={processing} disabled={asset !== null && assetId === null}>
                                <Save className="h-4 w-4" />
                                {asset ? 'Update asset' : 'Create asset'}
                            </AppButton>
                        </>
                    }
                />

                {Object.keys(props.errors ?? {}).length > 0 ? (
                    <AppAlert
                        variant="danger"
                        title="Please review the highlighted fields"
                        description="Laravel validation prevented the asset from being saved. Correct the errors below and try again."
                    />
                ) : null}

                {asset && assetId === null ? (
                    <AppAlert
                        variant="danger"
                        title="Asset identifier is missing"
                        description="This record is missing its internal identifier, so edit mode actions are temporarily unavailable."
                    />
                ) : null}

                <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-6">
                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Asset identity</AppCardTitle>
                                <AppCardDescription>Key fields used during search, tagging, and asset recognition.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-2 md:col-span-2">
                                    <FieldLabel>Asset name</FieldLabel>
                                    <AppInput value={data.asset_name} onChange={(event) => setField('asset_name', event.target.value)} />
                                    <FieldError message={props.errors?.asset_name} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel hint="Leave blank to auto-generate.">Asset code</FieldLabel>
                                    <AppInput value={data.asset_code} onChange={(event) => setField('asset_code', event.target.value)} />
                                    <FieldError message={props.errors?.asset_code} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Category</FieldLabel>
                                    <AppSelect value={data.asset_category_id} onChange={(event) => setField('asset_category_id', event.target.value)}>
                                        <option value="">Select category</option>
                                        {renderOptions(props.options.categories)}
                                    </AppSelect>
                                    <FieldError message={props.errors?.asset_category_id} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Serial number</FieldLabel>
                                    <AppInput value={data.serial_number} onChange={(event) => setField('serial_number', event.target.value)} />
                                    <FieldError message={props.errors?.serial_number} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Brand</FieldLabel>
                                    <AppInput value={data.brand} onChange={(event) => setField('brand', event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Model</FieldLabel>
                                    <AppInput value={data.model} onChange={(event) => setField('model', event.target.value)} />
                                </div>
                            </AppCardContent>
                        </AppCard>

                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Manufacturer and procurement</AppCardTitle>
                                <AppCardDescription>Commercial and technical reference data for support, warranty, and vendor follow-up.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-2">
                                    <FieldLabel>Manufacturer</FieldLabel>
                                    <AppInput value={data.manufacturer} onChange={(event) => setField('manufacturer', event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Supplier</FieldLabel>
                                    <AppSelect value={data.supplier_id} onChange={(event) => setField('supplier_id', event.target.value)}>
                                        <option value="">Select supplier</option>
                                        {renderOptions(props.options.suppliers ?? [])}
                                    </AppSelect>
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Purchase date</FieldLabel>
                                    <AppDateField value={data.purchase_date} onChange={(event) => setField('purchase_date', event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Warranty start</FieldLabel>
                                    <AppDateField value={data.warranty_start} onChange={(event) => setField('warranty_start', event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Warranty end</FieldLabel>
                                    <AppDateField value={data.warranty_end} onChange={(event) => setField('warranty_end', event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Purchase cost</FieldLabel>
                                    <AppInput type="number" min="0" step="0.01" value={data.purchase_cost} onChange={(event) => setField('purchase_cost', event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Depreciation method</FieldLabel>
                                    <AppInput value={data.depreciation_method} onChange={(event) => setField('depreciation_method', event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Useful life (years)</FieldLabel>
                                    <AppInput type="number" min="0" value={data.useful_life_years} onChange={(event) => setField('useful_life_years', event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Residual value</FieldLabel>
                                    <AppInput type="number" min="0" step="0.01" value={data.residual_value} onChange={(event) => setField('residual_value', event.target.value)} />
                                </div>
                            </AppCardContent>
                        </AppCard>

                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Assignment and location</AppCardTitle>
                                <AppCardDescription>Operational placement data that reduces confusion during issue, return, and transfer workflows.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-3">
                                <div className="space-y-2">
                                    <FieldLabel>Department</FieldLabel>
                                    <AppSelect value={data.department_id} onChange={(event) => setField('department_id', event.target.value)}>
                                        <option value="">Select department</option>
                                        {renderOptions(props.options.departments)}
                                    </AppSelect>
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Location</FieldLabel>
                                    <AppSelect value={data.location_id} onChange={(event) => setField('location_id', event.target.value)}>
                                        <option value="">Select location</option>
                                        {renderOptions(props.options.locations)}
                                    </AppSelect>
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Room or area</FieldLabel>
                                    <AppInput value={data.room_or_area} onChange={(event) => setField('room_or_area', event.target.value)} />
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Assigned user</FieldLabel>
                                    <AppSelect value={data.assigned_user_id} onChange={(event) => setField('assigned_user_id', event.target.value)}>
                                        <option value="">Not assigned</option>
                                        {renderOptions(props.options.users)}
                                    </AppSelect>
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Assigned department</FieldLabel>
                                    <AppSelect value={data.assigned_department_id} onChange={(event) => setField('assigned_department_id', event.target.value)}>
                                        <option value="">Not assigned</option>
                                        {renderOptions(props.options.departments)}
                                    </AppSelect>
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Assigned location</FieldLabel>
                                    <AppSelect value={data.assigned_location_id} onChange={(event) => setField('assigned_location_id', event.target.value)}>
                                        <option value="">Not assigned</option>
                                        {renderOptions(props.options.locations)}
                                    </AppSelect>
                                </div>

                                <div className="space-y-2 md:col-span-2 xl:col-span-3">
                                    <FieldLabel>Custodian name</FieldLabel>
                                    <AppInput value={data.custodian_name} onChange={(event) => setField('custodian_name', event.target.value)} />
                                </div>
                            </AppCardContent>
                        </AppCard>
                    </div>

                    <div className="space-y-6">
                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Status and condition</AppCardTitle>
                                <AppCardDescription>Keep the operational state clear for hospital staff who depend on equipment readiness.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="space-y-5 p-6">
                                <div className="space-y-2">
                                    <FieldLabel>Asset status</FieldLabel>
                                    <AppSelect value={data.asset_status} onChange={(event) => setField('asset_status', event.target.value)}>
                                        {renderOptions(props.options.assetStatuses)}
                                    </AppSelect>
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Condition status</FieldLabel>
                                    <AppSelect value={data.condition_status} onChange={(event) => setField('condition_status', event.target.value)}>
                                        {renderOptions(props.options.conditionStatuses)}
                                    </AppSelect>
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel>Notes</FieldLabel>
                                    <AppTextarea value={data.notes} onChange={(event) => setField('notes', event.target.value)} rows={6} />
                                </div>
                            </AppCardContent>
                        </AppCard>

                        <AppCard>
                            <AppCardHeader className="border-b border-slate-100">
                                <AppCardTitle>Media</AppCardTitle>
                                <AppCardDescription>Attach a reference image if visual identification helps frontline staff.</AppCardDescription>
                            </AppCardHeader>
                            <AppCardContent className="space-y-5 p-6">
                                <div className="rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/80 p-5">
                                    {imagePreviewUrl ? (
                                        <img src={imagePreviewUrl} alt={data.asset_name || 'Asset preview'} className="h-56 w-full rounded-[1.25rem] object-cover" />
                                    ) : (
                                        <div className="grid h-56 place-items-center rounded-[1.25rem] border border-dashed border-slate-200 bg-white text-center">
                                            <div className="space-y-3 px-6">
                                                <div className="mx-auto w-fit rounded-2xl bg-primary-soft p-3 text-blue-700">
                                                    <ImagePlus className="h-6 w-6" />
                                                </div>
                                                <p className="font-semibold text-slate-900">No image selected</p>
                                                <p className="text-sm text-slate-500">Upload a JPG, PNG, or WEBP image when visual identification is useful.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <FieldLabel hint="Accepted formats: JPG, PNG, WEBP.">Asset image</FieldLabel>
                                    <AppInput
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={(event) => setField('image', event.target.files?.[0] ?? null)}
                                    />
                                    <FieldError message={props.errors?.image} />
                                </div>
                            </AppCardContent>
                        </AppCard>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
