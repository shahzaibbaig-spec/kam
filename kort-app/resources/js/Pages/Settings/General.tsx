import { useReactPage } from '@/Bridge/ReactPageContext';
import { SettingsField, SettingsFormSection, SettingsSaveBar } from '@/Components/domain/settings/SettingsComponents';
import { AppInput } from '@/Components/ui/AppInput';
import { AppSelect } from '@/Components/ui/AppSelect';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { asStringValue } from '@/Lib/forms';
import { SettingsFrame } from '@/Pages/Settings/SettingsFrame';
import type { GeneralSettingsFormData, SettingsGeneralPageProps } from '@/types/settings';

export default function SettingsGeneralPage() {
    const { props } = useReactPage<SettingsGeneralPageProps>();
    const form = useInertiaForm<GeneralSettingsFormData>({
        product_name: props.settings.product_name ?? '',
        organization_name: props.settings.organization_name ?? '',
        date_format: props.settings.date_format ?? 'Y-m-d',
        currency: props.settings.currency ?? 'PKR',
        timezone: props.settings.timezone ?? 'Asia/Karachi',
        default_pagination_size: asStringValue(props.settings.default_pagination_size),
        inventory_near_expiry_days: asStringValue(props.settings.inventory_near_expiry_days),
        low_stock_warning_threshold: asStringValue(props.settings.low_stock_warning_threshold),
        maintenance_due_soon_days: asStringValue(props.settings.maintenance_due_soon_days),
        support_email: props.settings.support_email ?? '',
        support_phone: props.settings.support_phone ?? '',
    });

    const submit = () => form.put(route('settings.general.update'));

    return (
        <SettingsFrame
            title="General Settings"
            description="Core organization identity, date and currency defaults, pagination, and system-wide thresholds."
            navigation={props.settingsNavigation}
        >
            <form
                className="space-y-6"
                onSubmit={(event) => {
                    event.preventDefault();
                    submit();
                }}
            >
                <SettingsFormSection
                    title="Organization Identity"
                    description="Control the primary product and hospital naming shown across the application."
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <SettingsField label="Software Name" error={form.errors.product_name} required>
                            <AppInput value={form.data.product_name} onChange={(event) => form.setData('product_name', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                        <SettingsField label="Organization / Hospital Name" error={form.errors.organization_name} required>
                            <AppInput value={form.data.organization_name} onChange={(event) => form.setData('organization_name', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                    </div>
                </SettingsFormSection>

                <SettingsFormSection
                    title="Regional Defaults"
                    description="Keep date formatting, currency, timezone, and pagination aligned across operational screens."
                >
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <SettingsField label="Date Format" error={form.errors.date_format} required>
                            <AppSelect value={form.data.date_format} onChange={(event) => form.setData('date_format', event.target.value)} disabled={!props.permissions.update}>
                                <option value="Y-m-d">YYYY-MM-DD</option>
                                <option value="d/m/Y">DD/MM/YYYY</option>
                                <option value="m/d/Y">MM/DD/YYYY</option>
                            </AppSelect>
                        </SettingsField>
                        <SettingsField label="Currency" error={form.errors.currency} required>
                            <AppInput value={form.data.currency} onChange={(event) => form.setData('currency', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                        <SettingsField label="Timezone" error={form.errors.timezone} required>
                            <AppInput value={form.data.timezone} onChange={(event) => form.setData('timezone', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                        <SettingsField label="Default Pagination Size" error={form.errors.default_pagination_size} required>
                            <AppInput type="number" min={10} max={100} value={form.data.default_pagination_size} onChange={(event) => form.setData('default_pagination_size', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                    </div>
                </SettingsFormSection>

                <SettingsFormSection
                    title="Operational Thresholds"
                    description="Use these defaults for expiry warnings, low stock visibility, and maintenance due-soon indicators."
                >
                    <div className="grid gap-5 md:grid-cols-3">
                        <SettingsField label="Near Expiry Threshold (days)" error={form.errors.inventory_near_expiry_days} required>
                            <AppInput type="number" min={1} max={365} value={form.data.inventory_near_expiry_days} onChange={(event) => form.setData('inventory_near_expiry_days', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                        <SettingsField label="Low Stock Warning Threshold" error={form.errors.low_stock_warning_threshold} required>
                            <AppInput type="number" min={0} value={form.data.low_stock_warning_threshold} onChange={(event) => form.setData('low_stock_warning_threshold', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                        <SettingsField label="Maintenance Due Soon (days)" error={form.errors.maintenance_due_soon_days} required>
                            <AppInput type="number" min={1} max={365} value={form.data.maintenance_due_soon_days} onChange={(event) => form.setData('maintenance_due_soon_days', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                    </div>
                </SettingsFormSection>

                <SettingsFormSection
                    title="Support Contacts"
                    description="Reference contacts for support or operational escalation in the admin interface."
                >
                    <div className="grid gap-5 md:grid-cols-2">
                        <SettingsField label="Support Email" error={form.errors.support_email}>
                            <AppInput type="email" value={form.data.support_email} onChange={(event) => form.setData('support_email', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                        <SettingsField label="Support Phone" error={form.errors.support_phone}>
                            <AppInput value={form.data.support_phone} onChange={(event) => form.setData('support_phone', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                    </div>
                </SettingsFormSection>

                <SettingsSaveBar
                    disabled={!props.permissions.update}
                    loading={form.processing}
                    dirtyLabel={props.permissions.update ? 'General settings are ready to save' : 'General settings are read-only for this role'}
                />
            </form>
        </SettingsFrame>
    );
}
