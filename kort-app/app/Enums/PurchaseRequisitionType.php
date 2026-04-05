<?php

namespace App\Enums;

enum PurchaseRequisitionType: string
{
    case Asset = 'asset';
    case Inventory = 'inventory';
    case Mixed = 'mixed';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
