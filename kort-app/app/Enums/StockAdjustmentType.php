<?php

namespace App\Enums;

enum StockAdjustmentType: string
{
    case Increase = 'increase';
    case Decrease = 'decrease';
    case Recount = 'recount';
    case Damage = 'damage';
    case Expiry = 'expiry';
    case Quarantine = 'quarantine';
    case Release = 'release';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
