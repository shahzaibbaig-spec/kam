<?php

namespace App\Enums;

enum AssetMovementType: string
{
    case Created = 'created';
    case Tagged = 'tagged';
    case Issued = 'issued';
    case Returned = 'returned';
    case Transferred = 'transferred';
    case StatusChanged = 'status_changed';
    case Updated = 'updated';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
