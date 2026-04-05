<?php

namespace App\Enums;

enum PurchaseRequisitionStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case UnderReview = 'under_review';
    case Approved = 'approved';
    case PartiallyOrdered = 'partially_ordered';
    case FullyOrdered = 'fully_ordered';
    case Rejected = 'rejected';
    case Cancelled = 'cancelled';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
