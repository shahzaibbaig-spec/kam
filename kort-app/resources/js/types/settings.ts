import type { ReactSharedPageProps } from '@/types/app-shell';

export interface SettingsNavigationItem {
    key: string;
    title: string;
    description: string;
    route: string;
    permission: string;
}

export interface SettingsPermissions {
    view?: boolean;
    update?: boolean;
}

export interface SettingsSummary {
    generalConfigured: number;
    labelsConfigured: number;
    notificationsConfigured: number;
}

export interface GeneralSettingsModel {
    product_name: string;
    organization_name: string;
    date_format: string;
    currency: string;
    timezone: string;
    default_pagination_size: number;
    inventory_near_expiry_days: number;
    low_stock_warning_threshold: number;
    maintenance_due_soon_days: number;
    support_email: string;
    support_phone: string;
}

export interface LabelSettingsModel {
    asset_tag_pattern: string;
    label_size: string;
    barcode_enabled: boolean;
    qr_enabled: boolean;
    include_department: boolean;
    include_location: boolean;
    print_margin_mm: number;
    label_footer: string;
}

export interface NotificationSettingsModel {
    email_audit_alerts: boolean;
    low_stock_digest: boolean;
    maintenance_reminders: boolean;
    procurement_approval_alerts: boolean;
    label_print_alerts: boolean;
    daily_digest_hour: number;
}

export interface GeneralSettingsFormData {
    [key: string]: string;
    product_name: string;
    organization_name: string;
    date_format: string;
    currency: string;
    timezone: string;
    default_pagination_size: string;
    inventory_near_expiry_days: string;
    low_stock_warning_threshold: string;
    maintenance_due_soon_days: string;
    support_email: string;
    support_phone: string;
}

export interface LabelSettingsFormData {
    [key: string]: string | boolean;
    asset_tag_pattern: string;
    label_size: string;
    barcode_enabled: boolean;
    qr_enabled: boolean;
    include_department: boolean;
    include_location: boolean;
    print_margin_mm: string;
    label_footer: string;
}

export interface NotificationSettingsFormData {
    [key: string]: string | boolean;
    email_audit_alerts: boolean;
    low_stock_digest: boolean;
    maintenance_reminders: boolean;
    procurement_approval_alerts: boolean;
    label_print_alerts: boolean;
    daily_digest_hour: string;
}

export interface SettingsIndexPageProps extends ReactSharedPageProps {
    settingsNavigation: SettingsNavigationItem[];
    permissions: SettingsPermissions;
    summary: SettingsSummary;
}

export interface SettingsGeneralPageProps extends ReactSharedPageProps {
    settingsNavigation: SettingsNavigationItem[];
    settings: GeneralSettingsModel;
    permissions: { update: boolean };
}

export interface SettingsLabelsPageProps extends ReactSharedPageProps {
    settingsNavigation: SettingsNavigationItem[];
    settings: LabelSettingsModel;
    permissions: { update: boolean };
}

export interface SettingsNotificationsPageProps extends ReactSharedPageProps {
    settingsNavigation: SettingsNavigationItem[];
    settings: NotificationSettingsModel;
    permissions: { update: boolean };
}
