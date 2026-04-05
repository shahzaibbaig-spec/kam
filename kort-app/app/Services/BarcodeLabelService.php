<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetTag;
use Picqer\Barcode\BarcodeGeneratorSVG;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class BarcodeLabelService
{
    public function buildLabelPayload(Asset $asset): array
    {
        $asset->loadMissing(['department', 'location', 'activeTag']);

        /** @var AssetTag|null $tag */
        $tag = $asset->activeTag;
        $barcodeValue = $tag?->barcode_value ?: $asset->barcode_value ?: $asset->tag_number;
        $qrValue = $tag?->qr_value ?: $asset->qr_value ?: route('assets.show', $asset);

        return [
            'asset_id' => $asset->id,
            'asset_name' => $asset->asset_name,
            'tag_number' => $tag?->tag_number ?: $asset->tag_number,
            'department_name' => $asset->department?->name,
            'location_name' => $asset->location?->name,
            'barcode_svg' => $barcodeValue ? $this->barcodeSvg($barcodeValue) : null,
            'qr_svg' => $qrValue ? $this->qrSvg($qrValue) : null,
        ];
    }

    public function buildMany(iterable $assets): array
    {
        $labels = [];

        foreach ($assets as $asset) {
            $labels[] = $this->buildLabelPayload($asset);
        }

        return $labels;
    }

    protected function barcodeSvg(string $value): string
    {
        $generator = new BarcodeGeneratorSVG();

        return $generator->getBarcode($value, $generator::TYPE_CODE_128, 2, 48);
    }

    protected function qrSvg(string $value): string
    {
        return QrCode::format('svg')
            ->size(132)
            ->margin(1)
            ->generate($value);
    }
}
