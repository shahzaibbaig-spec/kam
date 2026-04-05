import { useReactPage } from '@/Bridge/ReactPageContext';
import { LabelPreviewSettingsCard, SettingsBooleanField, SettingsField, SettingsFormSection, SettingsSaveBar } from '@/Components/domain/settings/SettingsComponents';
import { AppInput } from '@/Components/ui/AppInput';
import { AppSelect } from '@/Components/ui/AppSelect';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { asStringValue } from '@/Lib/forms';
import { SettingsFrame } from '@/Pages/Settings/SettingsFrame';
import type { LabelSettingsFormData, SettingsLabelsPageProps } from '@/types/settings';

export default function SettingsLabelsPage() {
    const { props } = useReactPage<SettingsLabelsPageProps>();
    const form = useInertiaForm<LabelSettingsFormData>({
        asset_tag_pattern: props.settings.asset_tag_pattern ?? '',
        label_size: props.settings.label_size ?? '50x25',
        barcode_enabled: props.settings.barcode_enabled ?? true,
        qr_enabled: props.settings.qr_enabled ?? true,
        include_department: props.settings.include_department ?? true,
        include_location: props.settings.include_location ?? true,
        print_margin_mm: asStringValue(props.settings.print_margin_mm),
        label_footer: props.settings.label_footer ?? '',
    });

    const submit = () => form.put(route('settings.labels.update'));

    return (
        <SettingsFrame
            title="Labels and Barcode Settings"
            description="Control tag formatting, barcode and QR visibility, print defaults, and hospital-ready label output."
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
                    title="Label Structure"
                    description="Define the base format and print dimensions used for asset labels."
                >
                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        <SettingsField label="Asset Tag Pattern" error={form.errors.asset_tag_pattern} required className="xl:col-span-2">
                            <AppInput value={form.data.asset_tag_pattern} onChange={(event) => form.setData('asset_tag_pattern', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                        <SettingsField label="Label Size" error={form.errors.label_size} required>
                            <AppSelect value={form.data.label_size} onChange={(event) => form.setData('label_size', event.target.value)} disabled={!props.permissions.update}>
                                <option value="50x25">50 x 25 mm</option>
                                <option value="60x40">60 x 40 mm</option>
                                <option value="80x50">80 x 50 mm</option>
                            </AppSelect>
                        </SettingsField>
                        <SettingsField label="Print Margin (mm)" error={form.errors.print_margin_mm} required>
                            <AppInput type="number" min={0} max={20} value={form.data.print_margin_mm} onChange={(event) => form.setData('print_margin_mm', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                        <SettingsField label="Footer Text" error={form.errors.label_footer} className="md:col-span-2 xl:col-span-4">
                            <AppInput value={form.data.label_footer} onChange={(event) => form.setData('label_footer', event.target.value)} disabled={!props.permissions.update} />
                        </SettingsField>
                    </div>
                </SettingsFormSection>

                <SettingsFormSection
                    title="Display Options"
                    description="Choose which identifiers and contextual details should appear on printed labels."
                >
                    <div className="grid gap-4">
                        <SettingsBooleanField
                            label="Show barcode"
                            description="Include the standard barcode stripe on asset labels for scanner workflows."
                            checked={form.data.barcode_enabled}
                            disabled={!props.permissions.update}
                            onCheckedChange={(checked) => form.setData('barcode_enabled', checked)}
                        />
                        <SettingsBooleanField
                            label="Show QR code"
                            description="Include a QR block for richer mobile and scan-to-detail workflows."
                            checked={form.data.qr_enabled}
                            disabled={!props.permissions.update}
                            onCheckedChange={(checked) => form.setData('qr_enabled', checked)}
                        />
                        <SettingsBooleanField
                            label="Include department"
                            description="Print the responsible department on the label for operational clarity."
                            checked={form.data.include_department}
                            disabled={!props.permissions.update}
                            onCheckedChange={(checked) => form.setData('include_department', checked)}
                        />
                        <SettingsBooleanField
                            label="Include location"
                            description="Print the default location or room context where appropriate."
                            checked={form.data.include_location}
                            disabled={!props.permissions.update}
                            onCheckedChange={(checked) => form.setData('include_location', checked)}
                        />
                    </div>
                </SettingsFormSection>

                <LabelPreviewSettingsCard
                    settings={{
                        asset_tag_pattern: form.data.asset_tag_pattern,
                        label_size: form.data.label_size,
                        barcode_enabled: form.data.barcode_enabled,
                        qr_enabled: form.data.qr_enabled,
                        include_department: form.data.include_department,
                        include_location: form.data.include_location,
                        print_margin_mm: Number(form.data.print_margin_mm || 0),
                        label_footer: form.data.label_footer,
                    }}
                />

                <SettingsSaveBar
                    disabled={!props.permissions.update}
                    loading={form.processing}
                    dirtyLabel={props.permissions.update ? 'Label settings are ready to save' : 'Label settings are read-only for this role'}
                />
            </form>
        </SettingsFrame>
    );
}
