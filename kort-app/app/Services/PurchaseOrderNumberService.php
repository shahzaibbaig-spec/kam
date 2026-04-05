<?php

namespace App\Services;

use App\Models\PurchaseOrder;
use Illuminate\Support\Facades\DB;

class PurchaseOrderNumberService
{
    public function generate(?string $date = null): string
    {
        $dateSegment = str($date ?: now()->toDateString())->replace('-', '')->toString();
        $prefix = 'PO-'.$dateSegment.'-';
        $latest = DB::table((new PurchaseOrder)->getTable())
            ->where('po_number', 'like', $prefix.'%')
            ->orderByDesc('po_number')
            ->value('po_number');

        $sequence = $latest ? ((int) str($latest)->afterLast('-')->toString()) + 1 : 1;

        do {
            $number = $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
            $sequence++;
        } while (PurchaseOrder::query()->withTrashed()->where('po_number', $number)->exists());

        return $number;
    }
}
