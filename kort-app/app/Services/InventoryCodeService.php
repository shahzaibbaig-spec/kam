<?php

namespace App\Services;

use App\Models\InventoryCategory;
use App\Models\StockAdjustment;
use App\Models\StockIssue;
use App\Models\StockReceipt;
use App\Models\StockReturn;
use App\Models\StockTransfer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class InventoryCodeService
{
    public function generateUuid(): string
    {
        return (string) Str::orderedUuid();
    }

    public function generateItemCode(?InventoryCategory $category = null): string
    {
        $segment = $this->codeSegment($category?->code, 'GEN');

        return $this->nextCode('inventory_items', 'item_code', 'INV-'.$segment.'-', 6);
    }

    public function generateReceiptNumber(?string $date = null): string
    {
        return $this->datedDocumentNumber('RCV', StockReceipt::class, 'receipt_number', $date);
    }

    public function generateIssueNumber(?string $date = null): string
    {
        return $this->datedDocumentNumber('ISS', StockIssue::class, 'issue_number', $date);
    }

    public function generateReturnNumber(?string $date = null): string
    {
        return $this->datedDocumentNumber('RET', StockReturn::class, 'return_number', $date);
    }

    public function generateTransferNumber(?string $date = null): string
    {
        return $this->datedDocumentNumber('TRF', StockTransfer::class, 'transfer_number', $date);
    }

    public function generateAdjustmentNumber(?string $date = null): string
    {
        return $this->datedDocumentNumber('ADJ', StockAdjustment::class, 'adjustment_number', $date);
    }

    protected function datedDocumentNumber(string $prefix, string $modelClass, string $column, ?string $date = null): string
    {
        $dateSegment = str($date ?: now()->toDateString())->replace('-', '')->toString();

        return $this->nextCode((new $modelClass)->getTable(), $column, $prefix.'-'.$dateSegment.'-', 4);
    }

    protected function nextCode(string $table, string $column, string $prefix, int $padding): string
    {
        $latest = DB::table($table)
            ->where($column, 'like', $prefix.'%')
            ->orderByDesc($column)
            ->value($column);

        $sequence = $latest ? ((int) str($latest)->afterLast('-')->toString()) + 1 : 1;

        do {
            $candidate = $prefix.str_pad((string) $sequence, $padding, '0', STR_PAD_LEFT);
            $sequence++;
        } while (DB::table($table)->where($column, $candidate)->exists());

        return $candidate;
    }

    protected function codeSegment(?string $rawCode, string $fallback): string
    {
        $segment = strtoupper((string) preg_replace('/[^A-Z0-9]/', '', (string) $rawCode));
        $segment = substr($segment, 0, 6);

        return $segment !== '' ? $segment : $fallback;
    }
}
