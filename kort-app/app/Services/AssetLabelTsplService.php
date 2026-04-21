<?php

namespace App\Services;

use App\Models\Asset;
use App\Models\AssetTag;
use Illuminate\Support\Str;
use Picqer\Barcode\BarcodeGeneratorSVG;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class AssetLabelTsplService
{
    public function settings(): PrinterSettings
    {
        return PrinterSettings::forTscTtp244Pro();
    }

    public function buildJob(iterable $assets): array
    {
        $settings = $this->settings();
        $labels = [];

        foreach ($assets as $asset) {
            if (! $asset instanceof Asset) {
                continue;
            }

            $asset->loadMissing(['department', 'location', 'activeTag']);
            $labels[] = $this->buildLabel($asset, $settings);
        }

        return [
            'settings' => $settings->toArray(),
            'labels' => $labels,
            'tspl' => collect($labels)->pluck('tspl')->filter()->implode(PHP_EOL.PHP_EOL),
        ];
    }

    protected function buildLabel(Asset $asset, PrinterSettings $settings): array
    {
        /** @var AssetTag|null $activeTag */
        $activeTag = $asset->activeTag;
        $assetNameRaw = trim((string) $asset->asset_name);
        $assetName = $this->truncate($assetNameRaw, $settings->assetNameMaxChars);
        $tagNumberRaw = trim((string) ($activeTag?->tag_number ?: $asset->tag_number ?: 'TAG-PENDING'));
        $tagNumber = $this->truncate($tagNumberRaw, $settings->tagNumberMaxChars);
        $barcodeValue = trim((string) ($activeTag?->barcode_value ?: $asset->barcode_value ?: $tagNumberRaw ?: $asset->asset_code));
        $qrValue = "/assets/{$asset->id}";

        return [
            'asset_id' => $asset->id,
            'asset_tag_id' => $activeTag?->id,
            'asset_name' => $assetName,
            'asset_name_full' => $assetNameRaw,
            'tag_number' => $tagNumber,
            'tag_number_full' => $tagNumberRaw,
            'department_name' => $asset->department?->name,
            'location_name' => $asset->location?->name,
            'barcode_value' => $barcodeValue,
            'qr_value' => $qrValue,
            'barcode_svg' => $this->barcodeSvg($barcodeValue, $settings->previewBarcodeHeight),
            'qr_svg' => $this->qrSvg($qrValue, $settings->previewQrSizePx),
            'tspl' => $this->generateLabelTspl(
                assetName: $assetName,
                tagNumber: $tagNumber,
                barcodeValue: $barcodeValue,
                qrValue: $qrValue,
                settings: $settings,
            ),
        ];
    }

    protected function generateLabelTspl(
        string $assetName,
        string $tagNumber,
        string $barcodeValue,
        string $qrValue,
        PrinterSettings $settings,
    ): string {
        $printableAssetName = $this->escapeTspl($assetName, 'UNKNOWN-ASSET');
        $printableTagNumber = $this->escapeTspl($tagNumber, 'TAG-PENDING');
        $printableBarcodeValue = $this->escapeTspl($barcodeValue, $printableTagNumber);
        $printableQrValue = $this->escapeTspl($qrValue, '/assets/0');

        $commands = [
            "SIZE {$settings->labelWidthMm} mm, {$settings->labelHeightMm} mm",
            "GAP {$settings->gapMm} mm",
            "DIRECTION {$settings->direction}",
            'CLS',
            sprintf('TEXT %d,%d,"1",0,1,1,"%s"', $settings->textX, $settings->assetNameY, $printableAssetName),
            sprintf('TEXT %d,%d,"1",0,1,1,"%s"', $settings->textX, $settings->tagNumberY, $printableTagNumber),
            sprintf(
                'QRCODE %d,%d,L,%d,A,0,M2,S7,"%s"',
                $settings->qrX,
                $settings->qrY,
                max(4, $settings->qrCellSize),
                $printableQrValue,
            ),
            sprintf(
                'BARCODE %d,%d,"128",%d,0,0,1,1,"%s"',
                $settings->barcodeX,
                $settings->barcodeY,
                max(40, $settings->barcodeHeight),
                $printableBarcodeValue,
            ),
            'PRINT 1,1',
        ];

        return implode(PHP_EOL, $commands);
    }

    protected function truncate(string $value, int $maxChars): string
    {
        $normalized = trim((string) preg_replace('/\s+/', ' ', $value));
        $length = max(1, $maxChars);

        return Str::limit($normalized, $length, '');
    }

    protected function barcodeSvg(string $value, int $height): string
    {
        $generator = new BarcodeGeneratorSVG;

        return $generator->getBarcode($value, $generator::TYPE_CODE_128, 2, max(40, $height));
    }

    protected function qrSvg(string $value, int $size): string
    {
        return QrCode::format('svg')
            ->size(max(96, $size))
            ->margin(1)
            ->generate($value);
    }

    protected function escapeTspl(string $value, string $fallback): string
    {
        $normalized = $this->ascii($value);
        $normalized = str_replace(['\\', '"'], ['/', "'"], $normalized);
        $normalized = trim((string) preg_replace('/\s+/', ' ', $normalized));

        return $normalized !== '' ? $normalized : $fallback;
    }

    protected function ascii(string $value): string
    {
        $cleaned = preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? '';
        $ascii = @iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $cleaned);

        if ($ascii !== false) {
            $cleaned = $ascii;
        }

        return preg_replace('/[^ -~]/', '', $cleaned) ?? '';
    }
}
