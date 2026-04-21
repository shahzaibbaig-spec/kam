<?php

namespace App\Services;

class PrinterSettings
{
    public function __construct(
        public readonly string $model,
        public readonly int $dpi,
        public readonly string $language,
        public readonly int $labelWidthMm,
        public readonly int $labelHeightMm,
        public readonly int $gapMm,
        public readonly int $direction,
        public readonly int $assetNameMaxChars,
        public readonly int $tagNumberMaxChars,
        public readonly int $qrCellSize,
        public readonly int $barcodeHeight,
        public readonly int $textX,
        public readonly int $assetNameY,
        public readonly int $tagNumberY,
        public readonly int $qrX,
        public readonly int $qrY,
        public readonly int $barcodeX,
        public readonly int $barcodeY,
        public readonly int $previewQrSizePx,
        public readonly int $previewBarcodeHeight,
    ) {}

    public static function forTscTtp244Pro(): self
    {
        return new self(
            model: 'TSC TTP-244 Pro',
            dpi: 203,
            language: 'TSPL',
            labelWidthMm: 38,
            labelHeightMm: 28,
            gapMm: 2,
            direction: 1,
            assetNameMaxChars: 20,
            tagNumberMaxChars: 20,
            qrCellSize: 4,
            barcodeHeight: 42,
            textX: 10,
            assetNameY: 10,
            tagNumberY: 30,
            qrX: 196,
            qrY: 58,
            barcodeX: 10,
            barcodeY: 176,
            previewQrSizePx: 96,
            previewBarcodeHeight: 44,
        );
    }

    public function mmToDots(int|float $millimeters): int
    {
        return (int) round($millimeters * ($this->dpi / 25.4));
    }

    public function labelWidthDots(): int
    {
        return $this->mmToDots($this->labelWidthMm);
    }

    public function labelHeightDots(): int
    {
        return $this->mmToDots($this->labelHeightMm);
    }

    public function toArray(): array
    {
        return [
            'model' => $this->model,
            'dpi' => $this->dpi,
            'language' => $this->language,
            'label_width_mm' => $this->labelWidthMm,
            'label_height_mm' => $this->labelHeightMm,
            'gap_mm' => $this->gapMm,
            'direction' => $this->direction,
            'asset_name_max_chars' => $this->assetNameMaxChars,
            'tag_number_max_chars' => $this->tagNumberMaxChars,
            'qr_cell_size' => $this->qrCellSize,
            'barcode_height' => $this->barcodeHeight,
            'text_x' => $this->textX,
            'asset_name_y' => $this->assetNameY,
            'tag_number_y' => $this->tagNumberY,
            'qr_x' => $this->qrX,
            'qr_y' => $this->qrY,
            'barcode_x' => $this->barcodeX,
            'barcode_y' => $this->barcodeY,
            'label_width_dots' => $this->labelWidthDots(),
            'label_height_dots' => $this->labelHeightDots(),
        ];
    }
}
