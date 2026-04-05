<?php

namespace App\Enums;

enum PurchaseOrderItemStatus: string
{
    case Pending = 'pending';
    case PartiallyReceived = 'partially_received';
    case FullyReceived = 'fully_received';
    case Cancelled = 'cancelled';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
