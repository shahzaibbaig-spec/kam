<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetLabelPrintLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'asset_id' => $this->asset_id,
            'asset_tag_id' => $this->asset_tag_id,
            'asset_name_printed' => $this->asset_name_printed,
            'tag_number_printed' => $this->tag_number_printed,
            'barcode_value_printed' => $this->barcode_value_printed,
            'qr_value_printed' => $this->qr_value_printed,
            'print_source' => $this->print_source,
            'output_format' => $this->output_format,
            'copies' => $this->copies,
            'printer_model' => $this->printer_model,
            'printer_language' => $this->printer_language,
            'printer_dpi' => $this->printer_dpi,
            'label_width_mm' => $this->label_width_mm,
            'label_height_mm' => $this->label_height_mm,
            'gap_mm' => $this->gap_mm,
            'direction' => $this->direction,
            'printed_at' => $this->printed_at?->toDateTimeString(),
            'printed_by_name' => $this->printedBy?->name,
            'reprinted_from_log_id' => $this->reprinted_from_log_id,
            'created_at' => $this->created_at?->toDateTimeString(),
        ];
    }
}
