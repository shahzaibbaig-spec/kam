<?php

namespace App\Enums;

enum ProcurementPriority: string
{
    case Low = 'low';
    case Normal = 'normal';
    case High = 'high';
    case Urgent = 'urgent';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
