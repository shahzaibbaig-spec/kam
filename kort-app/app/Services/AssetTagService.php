<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetTag;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AssetTagService
{
    public function __construct(
        protected AssetMovementService $movementService,
    ) {
    }

    public function preview(Asset $asset): string
    {
        if ($asset->activeTag) {
            return $asset->activeTag->tag_number;
        }

        return $this->buildTagNumber($asset);
    }

    public function generate(Asset $asset, User $actor, bool $force = false): AssetTag
    {
        $asset->loadMissing(['category', 'department', 'assignedDepartment', 'location.department', 'activeTag']);

        if ($asset->activeTag && ! $force) {
            throw ValidationException::withMessages([
                'tag_number' => 'This asset already has an active tag. Use regenerate if you need a replacement tag.',
            ]);
        }

        return DB::transaction(function () use ($asset, $actor, $force) {
            if ($force) {
                $asset->tags()->where('is_active', true)->update([
                    'is_active' => false,
                    'updated_by' => $actor->id,
                    'updated_at' => now(),
                ]);
            }

            $tagNumber = $this->buildTagNumber($asset);
            $qrValue = route('assets.show', $asset);

            $tag = $asset->tags()->create([
                'tag_number' => $tagNumber,
                'tag_format' => config('kort.asset_tag_pattern'),
                'barcode_value' => $tagNumber,
                'qr_value' => $qrValue,
                'printed_count' => 0,
                'is_active' => true,
                'created_by' => $actor->id,
                'updated_by' => $actor->id,
            ]);

            $asset->forceFill([
                'tag_number' => $tag->tag_number,
                'barcode_value' => $tag->barcode_value,
                'qr_value' => $tag->qr_value,
                'updated_by' => $actor->id,
            ])->save();

            $this->movementService->record($asset, $actor, [
                'movement_type' => 'tagged',
                'movement_datetime' => now(),
                'reference_type' => AssetTag::class,
                'reference_id' => $tag->id,
                'from_department_id' => $asset->department_id,
                'to_department_id' => $asset->department_id,
                'from_location_id' => $asset->location_id,
                'to_location_id' => $asset->location_id,
                'from_user_id' => $asset->assigned_user_id,
                'to_user_id' => $asset->assigned_user_id,
                'from_room_or_area' => $asset->room_or_area,
                'to_room_or_area' => $asset->room_or_area,
                'notes' => $force ? 'Asset tag regenerated.' : 'Asset tag generated.',
            ]);

            activity('assets')
                ->performedOn($asset)
                ->causedBy($actor)
                ->event($force ? 'tag-regenerated' : 'tag-generated')
                ->withProperties([
                    'tag_number' => $tag->tag_number,
                    'barcode_value' => $tag->barcode_value,
                    'qr_value' => $tag->qr_value,
                ])
                ->log($force ? 'Asset tag regenerated' : 'Asset tag generated');

            return $tag;
        });
    }

    public function bulkGenerate(Collection $assets, User $actor): array
    {
        $generated = 0;
        $skipped = 0;

        foreach ($assets as $asset) {
            if ($asset->activeTag) {
                $skipped++;
                continue;
            }

            $this->generate($asset, $actor);
            $generated++;
        }

        return [
            'generated' => $generated,
            'skipped' => $skipped,
        ];
    }

    public function markPrinted(iterable $assets, User $actor): void
    {
        foreach ($assets as $asset) {
            $activeTag = $asset->activeTag;

            if (! $activeTag) {
                continue;
            }

            $activeTag->increment('printed_count');
            $activeTag->forceFill([
                'last_printed_at' => now(),
                'updated_by' => $actor->id,
            ])->save();

            activity('assets')
                ->performedOn($asset)
                ->causedBy($actor)
                ->event('label-printed')
                ->withProperties([
                    'tag_number' => $activeTag->tag_number,
                    'printed_count' => $activeTag->printed_count,
                ])
                ->log('Asset label printed');
        }
    }

    protected function buildTagNumber(Asset $asset): string
    {
        $departmentCode = $this->departmentCode($asset);
        $typeCode = $this->typeCode($asset);
        $prefix = "BC-KORT-{$departmentCode}-{$typeCode}-";

        $latest = AssetTag::query()
            ->where('tag_number', 'like', $prefix.'%')
            ->orderByDesc('tag_number')
            ->value('tag_number');

        $sequence = $latest ? ((int) substr($latest, -6)) + 1 : 1;

        do {
            $tagNumber = sprintf('%s%06d', $prefix, $sequence);
            $sequence++;
        } while (AssetTag::query()->where('tag_number', $tagNumber)->exists());

        return $tagNumber;
    }

    protected function departmentCode(Asset $asset): string
    {
        $source = $asset->department?->code
            ?: $asset->assignedDepartment?->code
            ?: $asset->location?->department?->code;

        return $this->sanitizeCode($source, 'GEN');
    }

    protected function typeCode(Asset $asset): string
    {
        $categoryCode = (string) $asset->category?->code;
        $candidate = Str::before($categoryCode, '-') ?: Str::substr($categoryCode, 0, 3);

        return $this->sanitizeCode($candidate, 'EQP');
    }

    protected function sanitizeCode(?string $value, string $fallback): string
    {
        $normalized = strtoupper((string) preg_replace('/[^A-Z0-9]/', '', (string) $value));

        return $normalized !== '' ? Str::limit($normalized, 8, '') : $fallback;
    }
}
