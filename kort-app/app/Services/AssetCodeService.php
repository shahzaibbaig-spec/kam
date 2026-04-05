<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\Department;
use Illuminate\Support\Str;

class AssetCodeService
{
    public function generateUuid(): string
    {
        return (string) Str::orderedUuid();
    }

    public function generateAssetCode(?Department $department = null): string
    {
        $departmentCode = $this->normalizeDepartmentCode($department?->code);
        $prefix = str_replace(
            ['[DEPARTMENT]', '[SEQUENCE]'],
            [$departmentCode, ''],
            config('kort.asset_code_pattern')
        );

        $latest = Asset::query()
            ->withTrashed()
            ->where('asset_code', 'like', $prefix.'%')
            ->orderByDesc('asset_code')
            ->value('asset_code');

        $sequence = $latest ? ((int) substr($latest, -6)) + 1 : 1;

        return sprintf('%s%06d', $prefix, $sequence);
    }

    protected function normalizeDepartmentCode(?string $code): string
    {
        $normalized = strtoupper((string) preg_replace('/[^A-Z0-9]/', '', (string) $code));

        return $normalized !== '' ? Str::limit($normalized, 8, '') : 'GEN';
    }
}
