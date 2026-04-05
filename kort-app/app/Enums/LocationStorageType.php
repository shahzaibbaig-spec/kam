<?php

namespace App\Enums;

enum LocationStorageType: string
{
    case General = 'general';
    case Sterile = 'sterile';
    case NonSterile = 'non_sterile';
    case Isolation = 'isolation';
    case EmergencyReserve = 'emergency_reserve';
}
