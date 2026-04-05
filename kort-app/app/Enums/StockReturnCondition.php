<?php

namespace App\Enums;

enum StockReturnCondition: string
{
    case Usable = 'usable';
    case Damaged = 'damaged';
    case Contaminated = 'contaminated';
    case Expired = 'expired';

    public static function values(): array
    {
        return array_map(fn (self $condition) => $condition->value, self::cases());
    }
}
