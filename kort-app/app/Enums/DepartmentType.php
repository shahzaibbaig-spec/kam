<?php

namespace App\Enums;

enum DepartmentType: string
{
    case BurnClinical = 'burn_clinical';
    case Biomedical = 'biomedical';
    case Stores = 'stores';
    case Pharmacy = 'pharmacy';
    case Procurement = 'procurement';
    case Finance = 'finance';
    case Administration = 'administration';
    case Support = 'support';
}
