<?php

namespace App\Enums;

enum ProcurementApprovalAction: string
{
    case Submitted = 'submitted';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Returned = 'returned';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
