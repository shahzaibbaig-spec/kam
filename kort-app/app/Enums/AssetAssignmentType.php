<?php

namespace App\Enums;

enum AssetAssignmentType: string
{
    case Department = 'department';
    case Location = 'location';
    case Room = 'room';
    case Staff = 'staff';

    public static function values(): array
    {
        return array_map(fn (self $type) => $type->value, self::cases());
    }
}
