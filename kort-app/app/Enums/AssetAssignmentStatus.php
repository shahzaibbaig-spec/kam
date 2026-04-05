<?php

namespace App\Enums;

enum AssetAssignmentStatus: string
{
    case Active = 'active';
    case Returned = 'returned';
    case Transferred = 'transferred';
    case ClosedReassigned = 'closed_reassigned';

    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }
}
