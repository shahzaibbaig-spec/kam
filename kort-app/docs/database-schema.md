# Database Schema Overview

## Access and Organization

- `users`
  - department linkage, location linkage, employee ID, designation, status, login timestamp
- `departments`
  - code, type, cost center, clinical flag, manager reference
- `locations`
  - hierarchy support, storage type, barcode, isolation flag, emergency reserve flag, sterile flag
- `settings`
  - grouped JSON settings for hospital rules and system options
- Spatie tables
  - `roles`
  - `permissions`
  - `model_has_roles`
  - `model_has_permissions`
  - `role_has_permissions`
- Audit and platform tables
  - `activity_log`
  - `notifications`
  - `jobs`
  - `cache`
  - `sessions`

## Asset Module Foundation

- `asset_categories`
- `assets`
- `asset_tags`
- `asset_assignments`
- `asset_movements`
- `asset_maintenances`
- `asset_calibrations`
- `asset_disposals`

Highlights:
- unique asset UID
- barcode and QR value columns
- department, location, custodian, supplier links
- warranty and depreciation metadata
- maintenance and calibration due timestamps

## Inventory Module Foundation

- `inventory_categories`
- `inventory_items`
- `inventory_batches`
- `inventory_transactions`
- `stock_adjustments`

Highlights:
- batch and expiry support
- temperature-sensitive and controlled-use flags
- emergency reserve and sterile storage support
- transaction ledger design for receipts, issues, transfers, returns, and adjustments

## Procurement Module Foundation

- `suppliers`
- `purchase_requests`
- `purchase_request_items`
- `purchase_orders`
- `purchase_order_items`
- `goods_receipts`
- `goods_receipt_items`

Highlights:
- approval-ready requisition lifecycle
- PO receiving and discrepancy handling
- linkage to both stock items and asset categories

## Burn Center Design Notes

- storage separation is represented on locations and inventory
- emergency reserve storage points are first-class location attributes
- isolation mapping is encoded at the location level
- critical equipment support exists at asset category and asset level
- auditability is preserved across access, asset, and stock workflows
