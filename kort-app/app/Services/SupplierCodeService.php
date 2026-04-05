<?php

namespace App\Services;

use App\Models\Supplier;
use Illuminate\Support\Facades\DB;

class SupplierCodeService
{
    public function generate(): string
    {
        $latest = DB::table('suppliers')
            ->where('supplier_code', 'like', 'SUP-%')
            ->orderByDesc('supplier_code')
            ->value('supplier_code');

        $sequence = $latest ? ((int) str($latest)->afterLast('-')->toString()) + 1 : 1;

        do {
            $code = 'SUP-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
            $sequence++;
        } while (Supplier::query()->where('supplier_code', $code)->exists());

        return $code;
    }
}
