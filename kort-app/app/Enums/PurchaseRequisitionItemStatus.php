<?php

namespace App\Enums;

enum PurchaseRequisitionItemStatus: string
{
    case Pending = 'pending';
    case Approved = 'approved';
    case PartiallyOrdered = 'partially_ordered';
    case FullyOrdered = 'fully_ordered';
    case Cancelled = 'cancelled';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
