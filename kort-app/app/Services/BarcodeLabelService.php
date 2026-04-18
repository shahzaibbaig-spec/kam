<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetTag;
use Picqer\Barcode\BarcodeGeneratorSVG;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BarcodeLabelService
{
    public function buildLabelPayload(Asset $asset, array $printSettings = []): array
    {
        $asset->loadMissing(['department', 'location', 'activeTag']);

        /** @var AssetTag|null $tag */
        $tag = $asset->activeTag;
        $barcodeValue = $tag?->barcode_value ?: $asset->barcode_value ?: $asset->tag_number;
        $qrValue = $tag?->qr_value ?: $asset->qr_value ?: route('assets.show', $asset);
        $labelWidthMm = max(20, min(120, (int) ($printSettings['label_width_mm'] ?? 50)));
        $labelHeightMm = max(15, min(120, (int) ($printSettings['label_height_mm'] ?? 25)));
        $barcodeEnabled = (bool) ($printSettings['barcode_enabled'] ?? true);
        $qrEnabled = (bool) ($printSettings['qr_enabled'] ?? true);
        $barcodeHeight = $this->barcodeHeightFor($labelHeightMm);
        $qrSize = $this->qrSizeFor($labelWidthMm, $labelHeightMm);

        return [
            'asset_id' => $asset->id,
            'asset_name' => $asset->asset_name,
            'tag_number' => $tag?->tag_number ?: $asset->tag_number,
            'department_name' => $asset->department?->name,
            'location_name' => $asset->location?->name,
            'barcode_svg' => $barcodeEnabled && $barcodeValue ? $this->barcodeSvg($barcodeValue, $barcodeHeight) : null,
            'qr_svg' => $qrEnabled && $qrValue ? $this->qrSvg($qrValue, $qrSize) : null,
        ];
    }

    public function buildMany(iterable $assets, array $printSettings = []): array
    {
        $labels = [];

        foreach ($assets as $asset) {
            $labels[] = $this->buildLabelPayload($asset, $printSettings);
        }

        return $labels;
    }

    protected function barcodeSvg(string $value, int $height = 48): string
    {
        $generator = new BarcodeGeneratorSVG();

        return $generator->getBarcode($value, $generator::TYPE_CODE_128, 2, $height);
    }

    protected function qrSvg(string $value, int $size = 132): string
    {
        return QrCode::format('svg')
            ->size($size)
            ->margin(1)
            ->generate($value);
    }

    protected function barcodeHeightFor(int $labelHeightMm): int
    {
        return max(24, min(56, (int) round($labelHeightMm * 1.5)));
    }

    protected function qrSizeFor(int $labelWidthMm, int $labelHeightMm): int
    {
        $baseSize = min($labelWidthMm, $labelHeightMm);

        return max(56, min(128, (int) round($baseSize * 3)));
    }
}
