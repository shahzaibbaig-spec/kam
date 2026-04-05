<?php

namespace App\Enums;

enum AssetStatus: string
{
    case Available = 'available';
    case InUse = 'in_use';
    case UnderCleaning = 'under_cleaning';
    case UnderMaintenance = 'under_maintenance';
    case UnderCalibration = 'under_calibration';
    case OutOfOrder = 'out_of_order';
    case Lost = 'lost';
    case Condemned = 'condemned';
    case Disposed = 'disposed';

    public static function values(): array
    {
        return array_map(fn (self $status) => $status->value, self::cases());
    }

    public function label(): string
    {
        return str($this->value)->replace('_', ' ')->title()->toString();
    }

    public function canBeIssued(): bool
    {
        return $this === self::Available;
    }
}
