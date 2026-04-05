<?php

namespace App\Services;

use App\Models\GoodsReceipt;
use Illuminate\Support\Facades\DB;

class GoodsReceiptNumberService
{
    public function generate(?string $date = null): string
    {
        $dateSegment = str($date ?: now()->toDateString())->replace('-', '')->toString();
        $prefix = 'GRN-'.$dateSegment.'-';
        $latest = DB::table((new GoodsReceipt)->getTable())
            ->where('grn_number', 'like', $prefix.'%')
            ->orderByDesc('grn_number')
            ->value('grn_number');

        $sequence = $latest ? ((int) str($latest)->afterLast('-')->toString()) + 1 : 1;

        do {
            $number = $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
            $sequence++;
        } while (GoodsReceipt::query()->where('grn_number', $number)->exists());

        return $number;
    }
}
