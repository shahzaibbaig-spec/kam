<?php

namespace App\Enums;

enum InventoryTransactionType: string
{
    case OpeningBalance = 'opening_balance';
    case Received = 'received';
    case Issued = 'issued';
    case Returned = 'returned';
    case TransferredOut = 'transferred_out';
    case TransferredIn = 'transferred_in';
    case AdjustedIn = 'adjusted_in';
    case AdjustedOut = 'adjusted_out';
    case Quarantined = 'quarantined';
    case ReleasedFromQuarantine = 'released_from_quarantine';
    case Damaged = 'damaged';
    case Expired = 'expired';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
