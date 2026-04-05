<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\InventoryItem;
use App\Models\InventoryCategory;
use App\Models\InventoryBatch;
use App\Models\Location;
use App\Models\Supplier;
use App\Models\User;
use App\Services\StockAdjustmentService;
use App\Services\StockIssueService;
use App\Services\StockReceiptService;
use App\Services\StockReturnService;
use App\Services\StockTransferService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class InventoryLifecycleSeeder extends Seeder
{
    public function run(): void
    {
        $storeManager = User::query()->where('email', 'store.manager@kort.local')->firstOrFail();
        $pharmacist = User::query()->where('email', 'pharmacist@kort.local')->firstOrFail();
        $nurseSupervisor = User::query()->where('email', 'nurse.supervisor@kort.local')->firstOrFail();
        $staffNurse = User::query()->where('email', 'staff.nurse@kort.local')->firstOrFail();

        $departments = Department::query()->get()->keyBy('code');
        $locations = Location::query()->get()->keyBy('code');
        $suppliers = Supplier::query()->get()->keyBy('supplier_code');

        $categories = collect([
            ['code' => 'CAT-BDR', 'name' => 'Burn Dressings', 'description' => 'Primary antimicrobial and protective dressings for burn wound coverage.'],
            ['code' => 'CAT-WCS', 'name' => 'Wound Care Supplies', 'description' => 'Routine sterile wound care and procedure support items.'],
            ['code' => 'CAT-IVP', 'name' => 'IV and Procedure Supplies', 'description' => 'Infusion, access, catheter, and bedside procedure stock.'],
            ['code' => 'CAT-PPE', 'name' => 'PPE and Infection Control', 'description' => 'Barrier protection and infection prevention consumables.'],
            ['code' => 'CAT-MED', 'name' => 'Medicines', 'description' => 'Topical and injectable medicines used in the burn center.'],
            ['code' => 'CAT-LIN', 'name' => 'Linen and Disposables', 'description' => 'Disposable patient support textiles and drapes.'],
            ['code' => 'CAT-CLS', 'name' => 'Cleaning and Sterilization', 'description' => 'Cleaning chemicals and sterile processing consumables.'],
            ['code' => 'CAT-EMR', 'name' => 'Emergency Supplies', 'description' => 'Emergency trolley and crash cart consumable sets.'],
        ])->mapWithKeys(fn (array $category) => [
            $category['code'] => InventoryCategory::query()->updateOrCreate(
                ['code' => $category['code']],
                $category + ['is_active' => true, 'created_by' => $storeManager->id, 'updated_by' => $storeManager->id]
            ),
        ]);

        $groups = [
            ['category' => 'CAT-BDR', 'short' => 'BDR', 'supplier' => 'SUP-HBMS', 'location' => 'LOC-CBST-01', 'zone' => 'Sterile Rack A1', 'sterile' => true, 'controlled' => true, 'items' => [
                'silver-sulfadiazine-dressing-10x10' => ['name' => 'Silver Sulfadiazine Dressing 10x10', 'uom' => 'pack', 'reorder' => 40, 'min' => 20, 'max' => 180],
                'antimicrobial-foam-dressing-15x15' => ['name' => 'Antimicrobial Foam Dressing 15x15', 'uom' => 'pack', 'reorder' => 28, 'min' => 14, 'max' => 120],
                'hydrogel-sheet-large' => ['name' => 'Hydrogel Sheet Large', 'uom' => 'sheet', 'reorder' => 18, 'min' => 10, 'max' => 80],
                'paraffin-gauze-dressing' => ['name' => 'Paraffin Gauze Dressing', 'uom' => 'pack', 'reorder' => 20, 'min' => 10, 'max' => 90],
                'alginate-burn-dressing' => ['name' => 'Alginate Burn Dressing', 'uom' => 'pack', 'reorder' => 16, 'min' => 8, 'max' => 70],
                'silicone-contact-layer' => ['name' => 'Silicone Contact Layer', 'uom' => 'pack', 'reorder' => 14, 'min' => 8, 'max' => 60],
            ]],
            ['category' => 'CAT-WCS', 'short' => 'WCS', 'supplier' => 'SUP-HBMS', 'location' => 'LOC-CBST-01', 'zone' => 'Procedure Shelf B2', 'sterile' => true, 'controlled' => false, 'items' => [
                'sterile-gauze-pack' => ['name' => 'Sterile Gauze Pack', 'uom' => 'pack', 'reorder' => 60, 'min' => 30, 'max' => 220],
                'roller-bandage-10cm' => ['name' => 'Roller Bandage 10cm', 'uom' => 'roll', 'reorder' => 35, 'min' => 20, 'max' => 140],
                'micropore-tape-2-5cm' => ['name' => 'Micropore Tape 2.5cm', 'uom' => 'roll', 'reorder' => 25, 'min' => 12, 'max' => 100],
                'non-adherent-pad' => ['name' => 'Non-Adherent Pad', 'uom' => 'pack', 'reorder' => 20, 'min' => 10, 'max' => 90],
                'burn-debridement-kit' => ['name' => 'Burn Debridement Kit', 'uom' => 'kit', 'reorder' => 8, 'min' => 4, 'max' => 30],
                'saline-irrigation-set' => ['name' => 'Saline Irrigation Set', 'uom' => 'set', 'reorder' => 15, 'min' => 8, 'max' => 60],
            ]],
            ['category' => 'CAT-IVP', 'short' => 'IVP', 'supplier' => 'SUP-HBMS', 'location' => 'LOC-CBST-01', 'zone' => 'Procedure Shelf C1', 'sterile' => true, 'controlled' => false, 'items' => [
                'iv-cannula-18g' => ['name' => 'IV Cannula 18G', 'uom' => 'box', 'reorder' => 18, 'min' => 10, 'max' => 80],
                'iv-cannula-20g' => ['name' => 'IV Cannula 20G', 'uom' => 'box', 'reorder' => 20, 'min' => 10, 'max' => 90],
                'syringe-5ml' => ['name' => 'Syringe 5ml', 'uom' => 'box', 'reorder' => 40, 'min' => 20, 'max' => 180],
                'syringe-10ml' => ['name' => 'Syringe 10ml', 'uom' => 'box', 'reorder' => 22, 'min' => 10, 'max' => 120],
                'urinary-catheter-14fr' => ['name' => 'Urinary Catheter 14Fr', 'uom' => 'box', 'reorder' => 10, 'min' => 6, 'max' => 40],
                'central-line-dressing-set' => ['name' => 'Central Line Dressing Set', 'uom' => 'set', 'reorder' => 10, 'min' => 5, 'max' => 40],
                'normal-saline-500ml' => ['name' => 'Normal Saline 500ml', 'uom' => 'bag', 'reorder' => 45, 'min' => 25, 'max' => 220],
                'ringer-lactate-500ml' => ['name' => 'Ringer Lactate 500ml', 'uom' => 'bag', 'reorder' => 40, 'min' => 20, 'max' => 200],
            ]],
            ['category' => 'CAT-PPE', 'short' => 'PPE', 'supplier' => 'SUP-SHT', 'location' => 'LOC-CBST-02', 'zone' => 'Infection Control Rack D1', 'sterile' => false, 'controlled' => false, 'items' => [
                'n95-mask' => ['name' => 'N95 Mask', 'uom' => 'box', 'reorder' => 30, 'min' => 15, 'max' => 160],
                'surgical-mask' => ['name' => 'Surgical Mask', 'uom' => 'box', 'reorder' => 40, 'min' => 20, 'max' => 200],
                'sterile-gloves-medium' => ['name' => 'Sterile Gloves Medium', 'uom' => 'box', 'reorder' => 28, 'min' => 14, 'max' => 150],
                'sterile-gloves-large' => ['name' => 'Sterile Gloves Large', 'uom' => 'box', 'reorder' => 24, 'min' => 12, 'max' => 130],
                'face-shield' => ['name' => 'Face Shield', 'uom' => 'unit', 'reorder' => 10, 'min' => 5, 'max' => 50],
                'disposable-gown' => ['name' => 'Disposable Gown', 'uom' => 'pack', 'reorder' => 20, 'min' => 10, 'max' => 100],
            ]],
            ['category' => 'CAT-MED', 'short' => 'MED', 'supplier' => 'SUP-HBMS', 'location' => 'LOC-BPH-01', 'zone' => 'Cold Chain Shelf P1', 'sterile' => false, 'controlled' => true, 'temperature' => true, 'items' => [
                'silver-sulfadiazine-cream-500g' => ['name' => 'Silver Sulfadiazine Cream 500g', 'uom' => 'jar', 'reorder' => 18, 'min' => 10, 'max' => 80],
                'mafenide-acetate-cream' => ['name' => 'Mafenide Acetate Cream', 'uom' => 'tube', 'reorder' => 12, 'min' => 6, 'max' => 50],
                'povidone-iodine-solution-500ml' => ['name' => 'Povidone Iodine Solution 500ml', 'uom' => 'bottle', 'reorder' => 15, 'min' => 8, 'max' => 60],
                'chlorhexidine-skin-prep' => ['name' => 'Chlorhexidine Skin Prep', 'uom' => 'bottle', 'reorder' => 10, 'min' => 5, 'max' => 40],
                'topical-lidocaine-gel' => ['name' => 'Topical Lidocaine Gel', 'uom' => 'tube', 'reorder' => 10, 'min' => 5, 'max' => 40],
                'paracetamol-iv-1g' => ['name' => 'Paracetamol IV 1g', 'uom' => 'vial', 'reorder' => 25, 'min' => 12, 'max' => 100],
            ]],
            ['category' => 'CAT-LIN', 'short' => 'LIN', 'supplier' => 'SUP-SHT', 'location' => 'LOC-CBST-02', 'zone' => 'Disposable Rack E2', 'sterile' => false, 'controlled' => false, 'items' => [
                'burn-sheet-disposable' => ['name' => 'Burn Sheet Disposable', 'uom' => 'pack', 'reorder' => 20, 'min' => 10, 'max' => 100],
                'sterile-drape-large' => ['name' => 'Sterile Drape Large', 'uom' => 'pack', 'reorder' => 14, 'min' => 8, 'max' => 60],
                'pillow-cover-disposable' => ['name' => 'Pillow Cover Disposable', 'uom' => 'pack', 'reorder' => 16, 'min' => 8, 'max' => 70],
                'draw-sheet-sterile' => ['name' => 'Draw Sheet Sterile', 'uom' => 'pack', 'reorder' => 12, 'min' => 6, 'max' => 50],
            ]],
            ['category' => 'CAT-CLS', 'short' => 'CLS', 'supplier' => 'SUP-SHT', 'location' => 'LOC-CBST-02', 'zone' => 'Cleaning Shelf F1', 'sterile' => false, 'controlled' => false, 'items' => [
                'disinfectant-solution-5l' => ['name' => 'Disinfectant Solution 5L', 'uom' => 'can', 'reorder' => 12, 'min' => 6, 'max' => 40],
                'enzymatic-cleaner-1l' => ['name' => 'Enzymatic Cleaner 1L', 'uom' => 'bottle', 'reorder' => 10, 'min' => 5, 'max' => 30],
                'sterilization-wrap-roll' => ['name' => 'Sterilization Wrap Roll', 'uom' => 'roll', 'reorder' => 8, 'min' => 4, 'max' => 24],
                'surface-wipe-pack' => ['name' => 'Surface Wipe Pack', 'uom' => 'pack', 'reorder' => 18, 'min' => 8, 'max' => 80],
            ]],
            ['category' => 'CAT-EMR', 'short' => 'EMR', 'supplier' => 'SUP-HBMS', 'location' => 'LOC-CBST-03', 'zone' => 'Emergency Reserve Cage', 'sterile' => false, 'controlled' => true, 'high_risk' => true, 'items' => [
                'crash-cart-burn-kit' => ['name' => 'Crash Cart Burn Kit', 'uom' => 'kit', 'reorder' => 5, 'min' => 2, 'max' => 20],
                'emergency-airway-pack' => ['name' => 'Emergency Airway Pack', 'uom' => 'pack', 'reorder' => 6, 'min' => 3, 'max' => 24],
                'resuscitation-syringe-kit' => ['name' => 'Resuscitation Syringe Kit', 'uom' => 'kit', 'reorder' => 6, 'min' => 3, 'max' => 24],
                'burn-trolley-consumable-set' => ['name' => 'Burn Trolley Consumable Set', 'uom' => 'set', 'reorder' => 8, 'min' => 4, 'max' => 30],
            ]],
        ];

        $items = [];
        foreach ($groups as $group) {
            $category = $categories[$group['category']];
            $location = $locations[$group['location']];
            $supplier = $suppliers[$group['supplier']];
            $sequence = 1;

            foreach ($group['items'] as $slug => $item) {
                $itemNumber = $sequence++;
                $code = sprintf('INV-%s-%03d', $group['short'], $itemNumber);
                $items[$slug] = InventoryItem::query()->updateOrCreate(
                    ['item_code' => $code],
                    [
                        'item_uuid' => InventoryItem::query()->where('item_code', $code)->value('item_uuid') ?: (string) Str::orderedUuid(),
                        'item_name' => $item['name'],
                        'inventory_category_id' => $category->id,
                        'subcategory' => $category->name,
                        'barcode_value' => 'BCINV'.str_pad((string) (count($items) + 1), 6, '0', STR_PAD_LEFT),
                        'sku' => strtoupper($group['short']).'-'.str_pad((string) $itemNumber, 3, '0', STR_PAD_LEFT),
                        'unit_of_measure' => $item['uom'],
                        'pack_size' => $item['uom'] === 'box' ? '100 units' : null,
                        'reorder_level' => $item['reorder'],
                        'minimum_level' => $item['min'],
                        'maximum_level' => $item['max'],
                        'supplier_id' => $supplier->id,
                        'store_location_id' => $location->id,
                        'storage_zone' => $group['zone'],
                        'temperature_sensitive' => $group['temperature'] ?? false,
                        'sterile_item' => $group['sterile'],
                        'high_risk_item' => $group['high_risk'] ?? false,
                        'controlled_use' => $group['controlled'],
                        'is_active' => true,
                        'notes' => $item['name'].' configured for burn center inventory control.',
                        'created_by' => $storeManager->id,
                        'updated_by' => $storeManager->id,
                    ]
                );
            }
        }

        $receiptService = app(StockReceiptService::class);
        $issueService = app(StockIssueService::class);
        $returnService = app(StockReturnService::class);
        $transferService = app(StockTransferService::class);
        $adjustmentService = app(StockAdjustmentService::class);

        $baseReceipts = collect($items)
            ->map(function (InventoryItem $item, string $slug) {
                return [
                    'location_id' => $item->store_location_id,
                    'supplier_id' => $item->supplier_id,
                    'department_id' => $item->storeLocation?->department_id,
                    'line' => $this->line(
                        $item,
                        strtoupper(str($slug)->replace('-', '')->substr(0, 8)).'-A',
                        now()->subMonths(2)->toDateString(),
                        (($item->temperature_sensitive || $item->controlled_use) ? now()->addMonths(6) : now()->addMonths(10))->toDateString(),
                        $this->quantityFor($item),
                        $this->unitCostFor($item),
                        $item->storage_zone
                    ),
                ];
            })
            ->groupBy(fn (array $row) => $row['location_id'].'-'.$row['supplier_id']);

        foreach ($baseReceipts as $rows) {
            foreach ($rows->chunk(10) as $chunk) {
                $first = $chunk->first();

                $receiptService->receive([
                    'supplier_id' => $first['supplier_id'],
                    'department_id' => $first['department_id'],
                    'store_location_id' => $first['location_id'],
                    'receipt_date' => now()->subWeeks(4)->toDateString(),
                    'invoice_reference' => 'INV-SEED-'.str_pad((string) random_int(10, 99), 2, '0', STR_PAD_LEFT),
                    'delivery_note_number' => 'DN-SEED-'.str_pad((string) random_int(100, 999), 3, '0', STR_PAD_LEFT),
                    'received_by' => $storeManager->id,
                    'remarks' => 'Initial Phase 3 stock receipt seed.',
                    'items' => $chunk->pluck('line')->all(),
                ], $storeManager);
            }
        }

        $receiptService->receive([
            'supplier_id' => $suppliers['SUP-HBMS']->id,
            'department_id' => $departments['CBST']->id,
            'store_location_id' => $locations['LOC-CBST-01']->id,
            'receipt_date' => now()->subWeeks(2)->toDateString(),
            'invoice_reference' => 'HBMS-APR-2026',
            'delivery_note_number' => 'HBMS-DN-221',
            'received_by' => $storeManager->id,
            'remarks' => 'Near-expiry reinforcement stock for FEFO testing.',
            'items' => [
                $this->line($items['antimicrobial-foam-dressing-15x15'], 'AFD-NEAR-01', now()->subMonths(3)->toDateString(), now()->addDays(23)->toDateString(), 18, 725, 'Sterile Rack A1'),
                $this->line($items['hydrogel-sheet-large'], 'HYG-NEAR-01', now()->subMonths(4)->toDateString(), now()->addDays(16)->toDateString(), 14, 680, 'Sterile Rack A1'),
                $this->line($items['sterile-gauze-pack'], 'GAU-NEAR-01', now()->subMonths(2)->toDateString(), now()->addDays(27)->toDateString(), 35, 180, 'Procedure Shelf B2'),
                $this->line($items['iv-cannula-20g'], 'CAN20-NEAR', now()->subMonths(3)->toDateString(), now()->addDays(31)->toDateString(), 16, 320, 'Procedure Shelf C1'),
                $this->line($items['syringe-5ml'], 'SYR5-NEAR', now()->subMonths(2)->toDateString(), now()->addDays(18)->toDateString(), 26, 150, 'Procedure Shelf C1'),
            ],
        ], $storeManager);

        $receiptService->receive([
            'supplier_id' => $suppliers['SUP-HBMS']->id,
            'department_id' => $departments['BPH']->id,
            'store_location_id' => $locations['LOC-BPH-01']->id,
            'receipt_date' => now()->subWeeks(2)->toDateString(),
            'invoice_reference' => 'PHARM-APR-2026',
            'delivery_note_number' => 'PHARM-DN-501',
            'received_by' => $pharmacist->id,
            'remarks' => 'Pharmacy near-expiry and expired sample batches.',
            'items' => [
                $this->line($items['silver-sulfadiazine-cream-500g'], 'SSD-NEAR-01', now()->subMonths(2)->toDateString(), now()->addDays(20)->toDateString(), 12, 940, 'Cold Chain Shelf P1'),
                $this->line($items['chlorhexidine-skin-prep'], 'CHX-EXP-01', now()->subMonths(5)->toDateString(), now()->subDays(10)->toDateString(), 8, 420, 'Cold Chain Shelf P1'),
            ],
        ], $pharmacist);

        $issueOne = $issueService->issue([
            'issue_date' => now()->subDays(10)->toDateString(),
            'issue_type' => 'department',
            'department_id' => $departments['BICU']->id,
            'remarks' => 'Routine burn ICU wound care replenishment.',
            'items' => [
                ['inventory_item_id' => $items['silver-sulfadiazine-dressing-10x10']->id, 'quantity' => 48, 'remarks' => 'ICU dressing stock'],
                ['inventory_item_id' => $items['sterile-gauze-pack']->id, 'quantity' => 70, 'remarks' => 'ICU gauze stock'],
                ['inventory_item_id' => $items['iv-cannula-20g']->id, 'quantity' => 28, 'remarks' => 'Procedure tray replenishment'],
                ['inventory_item_id' => $items['syringe-5ml']->id, 'quantity' => 60, 'remarks' => 'Medication round stock'],
                ['inventory_item_id' => $items['silver-sulfadiazine-cream-500g']->id, 'quantity' => 16, 'remarks' => 'Topical medication issue'],
            ],
        ], $storeManager);

        $issueTwo = $issueService->issue([
            'issue_date' => now()->subDays(7)->toDateString(),
            'issue_type' => 'location',
            'department_id' => $departments['BWRD']->id,
            'location_id' => $locations['LOC-BWRD-01']->id,
            'remarks' => 'Ward stock top-up.',
            'items' => [
                ['inventory_item_id' => $items['antimicrobial-foam-dressing-15x15']->id, 'quantity' => 20],
                ['inventory_item_id' => $items['hydrogel-sheet-large']->id, 'quantity' => 12],
                ['inventory_item_id' => $items['roller-bandage-10cm']->id, 'quantity' => 30],
                ['inventory_item_id' => $items['n95-mask']->id, 'quantity' => 80],
                ['inventory_item_id' => $items['sterile-gloves-medium']->id, 'quantity' => 50],
                ['inventory_item_id' => $items['burn-sheet-disposable']->id, 'quantity' => 22],
            ],
        ], $storeManager);

        $issueService->issue([
            'issue_date' => now()->subDays(5)->toDateString(),
            'issue_type' => 'staff',
            'department_id' => $departments['BDRU']->id,
            'issued_to_user_id' => $staffNurse->id,
            'remarks' => 'Procedure room rapid issue.',
            'items' => [
                ['inventory_item_id' => $items['central-line-dressing-set']->id, 'quantity' => 6],
                ['inventory_item_id' => $items['normal-saline-500ml']->id, 'quantity' => 24],
                ['inventory_item_id' => $items['paracetamol-iv-1g']->id, 'quantity' => 14],
            ],
        ], $nurseSupervisor);

        $hydrogelIssueItem = $issueTwo->items()->where('inventory_item_id', $items['hydrogel-sheet-large']->id)->first();
        $gauzeIssueItem = $issueOne->items()->where('inventory_item_id', $items['sterile-gauze-pack']->id)->first();

        $returnService->receive([
            'return_date' => now()->subDays(3)->toDateString(),
            'source_issue_id' => $issueOne->id,
            'returned_by' => $nurseSupervisor->id,
            'received_by' => $storeManager->id,
            'department_id' => $departments['BICU']->id,
            'location_id' => $locations['LOC-CBST-01']->id,
            'remarks' => 'Unused and contaminated stock returned from ICU.',
            'items' => [
                ['inventory_item_id' => $items['sterile-gauze-pack']->id, 'inventory_batch_id' => $gauzeIssueItem?->inventory_batch_id, 'quantity' => 8, 'return_condition' => 'usable', 'remarks' => 'Unused sterile stock'],
                ['inventory_item_id' => $items['hydrogel-sheet-large']->id, 'inventory_batch_id' => $hydrogelIssueItem?->inventory_batch_id, 'quantity' => 3, 'return_condition' => 'contaminated', 'remarks' => 'Package compromised during dressing round'],
            ],
        ], $storeManager);

        $silverBatch = InventoryBatch::query()
            ->where('inventory_item_id', $items['silver-sulfadiazine-dressing-10x10']->id)
            ->where('store_location_id', $locations['LOC-CBST-01']->id)
            ->where('available_quantity', '>', 0)
            ->orderBy('expiry_date')
            ->firstOrFail();
        $gauzeBatch = InventoryBatch::query()
            ->where('inventory_item_id', $items['sterile-gauze-pack']->id)
            ->where('store_location_id', $locations['LOC-CBST-01']->id)
            ->where('available_quantity', '>=', 6)
            ->orderBy('expiry_date')
            ->firstOrFail();

        $transferService->transfer([
            'transfer_date' => now()->subDays(2)->toDateString(),
            'from_location_id' => $silverBatch->store_location_id,
            'to_location_id' => $locations['LOC-CBST-03']->id,
            'from_department_id' => $departments['CBST']->id,
            'to_department_id' => $departments['CBST']->id,
            'remarks' => 'Emergency reserve refresh.',
            'items' => [
                ['inventory_item_id' => $items['silver-sulfadiazine-dressing-10x10']->id, 'inventory_batch_id' => $silverBatch->id, 'quantity' => 10],
                ['inventory_item_id' => $items['sterile-gauze-pack']->id, 'inventory_batch_id' => $gauzeBatch->id, 'quantity' => 6],
            ],
        ], $storeManager);

        $hydrogelBatch = InventoryBatch::query()->where('inventory_item_id', $items['hydrogel-sheet-large']->id)->orderBy('expiry_date')->firstOrFail();
        $burnSheetBatch = InventoryBatch::query()->where('inventory_item_id', $items['burn-sheet-disposable']->id)->orderBy('expiry_date')->firstOrFail();
        $expiredChxBatch = InventoryBatch::query()->where('inventory_item_id', $items['chlorhexidine-skin-prep']->id)->orderBy('expiry_date')->firstOrFail();

        $adjustmentService->adjust([
            'adjustment_date' => now()->subDay()->toDateString(),
            'adjustment_type' => 'quarantine',
            'reason' => 'Packaging integrity concern after transport inspection.',
            'location_id' => $hydrogelBatch->store_location_id,
            'department_id' => $departments['CBST']->id,
            'remarks' => 'Hydrogel sheets isolated pending review.',
            'items' => [[
                'inventory_item_id' => $items['hydrogel-sheet-large']->id,
                'inventory_batch_id' => $hydrogelBatch->id,
                'system_quantity' => $hydrogelBatch->available_quantity,
                'adjustment_quantity' => 2,
                'unit_of_measure' => $items['hydrogel-sheet-large']->unit_of_measure,
            ]],
        ], $storeManager);

        $adjustmentService->adjust([
            'adjustment_date' => now()->subDay()->toDateString(),
            'adjustment_type' => 'damage',
            'reason' => 'Disposable burn sheets torn during storage handling.',
            'location_id' => $burnSheetBatch->store_location_id,
            'department_id' => $departments['CBST']->id,
            'remarks' => 'Damaged stock segregated.',
            'items' => [[
                'inventory_item_id' => $items['burn-sheet-disposable']->id,
                'inventory_batch_id' => $burnSheetBatch->id,
                'system_quantity' => $burnSheetBatch->available_quantity,
                'adjustment_quantity' => 6,
                'unit_of_measure' => $items['burn-sheet-disposable']->unit_of_measure,
            ]],
        ], $storeManager);

        $adjustmentService->adjust([
            'adjustment_date' => now()->toDateString(),
            'adjustment_type' => 'expiry',
            'reason' => 'Expired antiseptic stock formally blocked from use.',
            'location_id' => $expiredChxBatch->store_location_id,
            'department_id' => $departments['BPH']->id,
            'remarks' => 'Expired chlorhexidine moved out of usable stock.',
            'items' => [[
                'inventory_item_id' => $items['chlorhexidine-skin-prep']->id,
                'inventory_batch_id' => $expiredChxBatch->id,
                'system_quantity' => $expiredChxBatch->available_quantity,
                'adjustment_quantity' => $expiredChxBatch->available_quantity,
                'unit_of_measure' => $items['chlorhexidine-skin-prep']->unit_of_measure,
            ]],
        ], $pharmacist);

        $adjustmentService->adjust([
            'adjustment_date' => now()->toDateString(),
            'adjustment_type' => 'release',
            'reason' => 'Partial quarantine release after biomedical and infection control clearance.',
            'location_id' => $hydrogelBatch->store_location_id,
            'department_id' => $departments['CBST']->id,
            'remarks' => 'Safe remainder released to usable stock.',
            'items' => [[
                'inventory_item_id' => $items['hydrogel-sheet-large']->id,
                'inventory_batch_id' => $hydrogelBatch->id,
                'system_quantity' => $hydrogelBatch->available_quantity,
                'adjustment_quantity' => 1,
                'unit_of_measure' => $items['hydrogel-sheet-large']->unit_of_measure,
            ]],
        ], $storeManager);

        $surgicalMaskBatch = InventoryBatch::query()->where('inventory_item_id', $items['surgical-mask']->id)->orderBy('expiry_date')->firstOrFail();
        $adjustmentService->adjust([
            'adjustment_date' => now()->toDateString(),
            'adjustment_type' => 'recount',
            'reason' => 'Physical count variance after weekly stock check.',
            'location_id' => $surgicalMaskBatch->store_location_id,
            'department_id' => $departments['CBST']->id,
            'remarks' => 'Mask count aligned to physical stock.',
            'items' => [[
                'inventory_item_id' => $items['surgical-mask']->id,
                'inventory_batch_id' => $surgicalMaskBatch->id,
                'system_quantity' => $surgicalMaskBatch->available_quantity,
                'physical_quantity' => max(0, (float) $surgicalMaskBatch->available_quantity - 5),
                'adjustment_quantity' => 0,
                'unit_of_measure' => $items['surgical-mask']->unit_of_measure,
            ]],
        ], $storeManager);
    }

    protected function line(InventoryItem $item, string $batchNumber, string $manufactureDate, string $expiryDate, int|float $quantity, int|float $unitCost, ?string $storageZone = null): array
    {
        return [
            'inventory_item_id' => $item->id,
            'batch_number' => $batchNumber,
            'manufacture_date' => $manufactureDate,
            'expiry_date' => $expiryDate,
            'quantity' => $quantity,
            'unit_cost' => $unitCost,
            'storage_zone' => $storageZone,
            'remarks' => 'Seeded for realistic burn center stock control.',
        ];
    }

    protected function quantityFor(InventoryItem $item): int
    {
        return match (true) {
            str($item->item_name)->contains(['Silver Sulfadiazine Dressing']) => 90,
            str($item->item_name)->contains(['Mask', 'Gloves']) => 180,
            str($item->item_name)->contains(['Syringe']) => 140,
            str($item->item_name)->contains(['500ml']) => 120,
            str($item->item_name)->contains(['Kit', 'Pack', 'Set']) => 40,
            $item->controlled_use => 35,
            default => 70,
        };
    }

    protected function unitCostFor(InventoryItem $item): float
    {
        return match (true) {
            str($item->item_name)->contains(['Cream', 'Paracetamol', 'Chlorhexidine']) => 850,
            str($item->item_name)->contains(['Dressing', 'Hydrogel']) => 620,
            str($item->item_name)->contains(['Fluid', 'Saline', 'Lactate']) => 210,
            str($item->item_name)->contains(['Mask', 'Gloves']) => 160,
            str($item->item_name)->contains(['Kit', 'Set']) => 980,
            default => 240,
        };
    }
}
