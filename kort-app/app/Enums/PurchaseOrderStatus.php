<?php

namespace App\Enums;

enum PurchaseOrderStatus: string
{
    case Draft = 'draft';
    case Issued = 'issued';
    case PartiallyReceived = 'partially_received';
    case FullyReceived = 'fully_received';
    case Cancelled = 'cancelled';
    case Closed = 'closed';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
