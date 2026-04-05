<?php

namespace App\Enums;

enum AssetConditionStatus: string
{
    case Excellent = 'excellent';
    case Good = 'good';
    case Fair = 'fair';
    case Damaged = 'damaged';
    case Critical = 'critical';

    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
