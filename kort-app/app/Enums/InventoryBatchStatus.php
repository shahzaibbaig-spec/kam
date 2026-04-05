<?php

namespace App\Enums;

enum InventoryBatchStatus: string
{
    case Active = 'active';
    case LowStock = 'low_stock';
    case Quarantined = 'quarantined';
    case Damaged = 'damaged';
    case Expired = 'expired';
    case Exhausted = 'exhausted';

    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
