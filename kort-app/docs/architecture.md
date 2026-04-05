# KORT Assest Managment System Architecture

## Product Context

KORT Assest Managment System is a hospital-focused asset and inventory platform tailored to burn center operations. The architecture emphasizes traceability, burn-center-specific storage controls, auditability, and predictable growth across future phases.

## Application Layers

1. Presentation Layer
   - Inertia.js + Vue 3 pages under `resources/js/Pages`
   - Shared shell and UI primitives under `resources/js/Layouts` and `resources/js/Components/App`
   - Role-filtered navigation shared through Inertia middleware

2. HTTP Layer
   - Controllers organized by module:
     - `Administration`
     - `Organization`
     - `Security`
   - Form requests centralize validation rules
   - Policies and Spatie permission middleware enforce access

3. Domain and Service Layer
   - Eloquent models represent hospital entities
   - `App\Services\DashboardService` builds role-aware dashboard data
   - `App\Support\PermissionRegistry` keeps permission groups and role matrices in one place
   - `App\Support\AppNavigation` derives UI navigation from permissions

4. Data Layer
   - MySQL or MariaDB is the intended production store
   - SQLite remains usable for lightweight local development
   - Schema is normalized by organization, assets, inventory, procurement, and maintenance modules

## Phase 1 Modules Implemented

- Authentication with Laravel Breeze
- User management
- Role and permission management
- Department and location management
- Audit log viewing
- Dashboard seeded with burn-center operational context
- Full schema foundation for later asset, inventory, procurement, and biomedical phases

## Key Packages

- `laravel/breeze`
- `spatie/laravel-permission`
- `spatie/laravel-activitylog`
- `maatwebsite/excel`
- `barryvdh/laravel-dompdf`
- `simplesoftwareio/simple-qrcode`
- `picqer/php-barcode-generator`

## Security Design

- Session-based authentication
- Self-registration disabled
- Gate-based super-admin override
- Policy and permission checks on CRUD routes
- Sensitive changes logged through activity logs and authentication event logging
- Soft deletes on users, departments, locations, suppliers, asset categories, assets, inventory categories, and inventory items

## Future Growth Path

- Phase 2: asset registry, tagging, barcode labels, movements
- Phase 3: inventory batches, FEFO issue workflows, quarantine handling
- Phase 4: procurement approvals, PO lifecycle, goods receiving
- Phase 5: maintenance, calibration, downtime, fit or unfit certification
- Phase 6: alerts, dashboards, exports, scheduled jobs
- Phase 7: UI hardening, tests, data imports, deployment readiness
