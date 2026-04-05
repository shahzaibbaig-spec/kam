<?php

namespace App\Enums;

enum SupplierType: string
{
    case AssetVendor = 'asset_vendor';
    case InventoryVendor = 'inventory_vendor';
    case Mixed = 'mixed';
    case ServiceVendor = 'service_vendor';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
