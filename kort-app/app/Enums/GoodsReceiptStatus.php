<?php

namespace App\Enums;

enum GoodsReceiptStatus: string
{
    case Draft = 'draft';
    case Received = 'received';
    case PartiallyProcessed = 'partially_processed';
    case Completed = 'completed';
    case Flagged = 'flagged';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
