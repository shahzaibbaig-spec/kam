<?php

namespace App\Services;

use App\Models\PurchaseRequisition;
use Illuminate\Support\Facades\DB;

class RequisitionNumberService
{
    public function generate(?string $date = null): string
    {
        $dateSegment = str($date ?: now()->toDateString())->replace('-', '')->toString();
        $prefix = 'PR-'.$dateSegment.'-';
        $latest = DB::table((new PurchaseRequisition)->getTable())
            ->where('requisition_number', 'like', $prefix.'%')
            ->orderByDesc('requisition_number')
            ->value('requisition_number');

        $sequence = $latest ? ((int) str($latest)->afterLast('-')->toString()) + 1 : 1;

        do {
            $number = $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
            $sequence++;
        } while (PurchaseRequisition::query()->withTrashed()->where('requisition_number', $number)->exists());

        return $number;
    }
}
