import { useReactPage } from '@/Bridge/ReactPageContext';
import { SettingsBooleanField, SettingsFormSection, SettingsPlaceholderCard, SettingsSaveBar } from '@/Components/domain/settings/SettingsComponents';
import { AppInput } from '@/Components/ui/AppInput';
import { useInertiaForm } from '@/Hooks/useInertiaForm';
import { asStringValue } from '@/Lib/forms';
import { SettingsFrame } from '@/Pages/Settings/SettingsFrame';
import type { NotificationSettingsFormData, SettingsNotificationsPageProps } from '@/types/settings';

export default function SettingsNotificationsPage() {
    const { props } = useReactPage<SettingsNotificationsPageProps>();
    const form = useInertiaForm<NotificationSettingsFormData>({
        email_audit_alerts: props.settings.email_audit_alerts ?? false,
        low_stock_digest: props.settings.low_stock_digest ?? true,
        maintenance_reminders: props.settings.maintenance_reminders ?? true,
        procurement_approval_alerts: props.settings.procurement_approval_alerts ?? true,
        label_print_alerts: props.settings.label_print_alerts ?? false,
        daily_digest_hour: asStringValue(props.settings.daily_digest_hour),
    });

    const submit = () => form.put(route('settings.notifications.update'));

    return (
        <SettingsFrame
            title="Notification Settings"
            description="Operational reminder toggles and alert placeholders for audit, inventory, maintenance, procurement, and label activity."
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
                    title="Alert Toggles"
                    description="Enable or disable the notification categories currently supported by the backend settings flow."
                >
                    <div className="grid gap-4">
                        <SettingsBooleanField
                            label="Email audit alerts"
                            description="Send audit-focused notifications when critical tracked events require attention."
                            checked={form.data.email_audit_alerts}
                            disabled={!props.permissions.update}
                            onCheckedChange={(checked) => form.setData('email_audit_alerts', checked)}
                        />
                        <SettingsBooleanField
                            label="Low stock digest"
                            description="Keep inventory leaders informed of replenishment pressure through a daily low-stock summary."
                            checked={form.data.low_stock_digest}
                            disabled={!props.permissions.update}
                            onCheckedChange={(checked) => form.setData('low_stock_digest', checked)}
                        />
                        <SettingsBooleanField
                            label="Maintenance reminders"
                            description="Surface reminders for upcoming maintenance and calibration work."
                            checked={form.data.maintenance_reminders}
                            disabled={!props.permissions.update}
                            onCheckedChange={(checked) => form.setData('maintenance_reminders', checked)}
                        />
                        <SettingsBooleanField
                            label="Procurement approval alerts"
                            description="Highlight approval work waiting in the requisition and procurement flow."
                            checked={form.data.procurement_approval_alerts}
                            disabled={!props.permissions.update}
                            onCheckedChange={(checked) => form.setData('procurement_approval_alerts', checked)}
                        />
                        <SettingsBooleanField
                            label="Label print alerts"
                            description="Placeholder control for barcode and label printing-related alerts."
                            checked={form.data.label_print_alerts}
                            disabled={!props.permissions.update}
                            onCheckedChange={(checked) => form.setData('label_print_alerts', checked)}
                        />
                    </div>
                </SettingsFormSection>

                <SettingsFormSection
                    title="Digest Schedule"
                    description="Control when the daily digest should be prepared for administrative review."
                >
                    <div className="grid gap-5 md:max-w-sm">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Daily Digest Hour</label>
                            <AppInput
                                type="number"
                                min={0}
                                max={23}
                                value={form.data.daily_digest_hour}
                                onChange={(event) => form.setData('daily_digest_hour', event.target.value)}
                                disabled={!props.permissions.update}
                            />
                            {form.errors.daily_digest_hour ? <p className="mt-2 text-sm text-rose-600">{form.errors.daily_digest_hour}</p> : null}
                        </div>
                    </div>
                </SettingsFormSection>

                <SettingsPlaceholderCard />

                <SettingsSaveBar
                    disabled={!props.permissions.update}
                    loading={form.processing}
                    dirtyLabel={props.permissions.update ? 'Notification settings are ready to save' : 'Notification settings are read-only for this role'}
                />
            </form>
        </SettingsFrame>
    );
}
