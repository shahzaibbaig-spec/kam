import {
    Activity,
    Archive,
    Boxes,
    Building2,
    ClipboardList,
    FileCheck2,
    FileStack,
    Gauge,
    PackageSearch,
    Receipt,
    ScrollText,
    Settings2,
    ShieldCheck,
    ShoppingCart,
    Tags,
    Truck,
    type LucideIcon,
    Wrench,
} from 'lucide-react';

const routeIconMap: Record<string, LucideIcon> = {
    dashboard: Gauge,
    'assets.index': Archive,
    'assets.categories.index': Tags,
    'assets.scan.index': PackageSearch,
    'inventory.items.index': Boxes,
    'inventory.categories.index': ClipboardList,
    'inventory.ledger.index': ScrollText,
    'inventory.scan.index': PackageSearch,
    'procurement.suppliers.index': Truck,
    'procurement.requisitions.index': FileStack,
    'procurement.purchase-orders.index': ShoppingCart,
    'procurement.goods-receipts.index': Receipt,
    'organization.departments.index': Building2,
    'organization.locations.index': Building2,
    'admin.users.index': ShieldCheck,
    'admin.roles.index': ShieldCheck,
    'security.audit-logs.index': Activity,
    'settings.index': Settings2,
    'settings.general': Settings2,
    'settings.labels': Settings2,
    'settings.notifications': Settings2,
    'reports.index': FileCheck2,
    'maintenance.index': Wrench,
    'maintenance.schedule': Wrench,
};

const labelIconMap: Record<string, LucideIcon> = {
    Dashboard: Gauge,
    Assets: Archive,
    Inventory: Boxes,
    Procurement: ShoppingCart,
    Security: ShieldCheck,
    Settings: Settings2,
};

export function getNavigationIcon(routeName: string, label: string) {
    return routeIconMap[routeName] ?? labelIconMap[label] ?? Archive;
}
