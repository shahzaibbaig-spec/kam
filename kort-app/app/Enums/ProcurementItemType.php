<?php

namespace App\Enums;

enum ProcurementItemType: string
{
    case Asset = 'asset';
    case Inventory = 'inventory';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
