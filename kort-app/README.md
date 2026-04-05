# KORT Assest Managment System

KORT Assest Managment System is a hospital-grade Laravel application for burn center asset, inventory, procurement, and biomedical workflows. This first working version delivers the full project architecture, normalized schema foundation, role and permission matrix, and a complete Phase 1 implementation.

## Stack

- Laravel 13
- PHP 8.3+
- Inertia.js + Vue 3 + Tailwind CSS
- Laravel Breeze authentication
- Spatie Laravel Permission
- Spatie Activity Log
- MySQL or MariaDB for production
- SQLite for lightweight local development
- Excel export, PDF export, QR and barcode package foundation

## Phase 1 Delivered

- authentication and session-based access
- self-registration disabled for hospital safety
- role and permission seeding for 11 hospital roles
- user management
- department management
- location management
- audit log viewing
- role-aware dashboard
- schema foundation for assets, inventory, procurement, maintenance, calibration, and disposals
- demo burn center dataset

## Folder References

- [docs/architecture.md](/c:/Users/Shahzaib/Desktop/KAM/kort-app/docs/architecture.md)
- [docs/database-schema.md](/c:/Users/Shahzaib/Desktop/KAM/kort-app/docs/database-schema.md)
- [docs/permissions-matrix.md](/c:/Users/Shahzaib/Desktop/KAM/kort-app/docs/permissions-matrix.md)

## Installation

1. Copy `.env.example` to `.env` for a MySQL or MariaDB setup.
2. Update database credentials.
3. Install PHP dependencies:

```bash
php composer.phar install
```

4. Install frontend dependencies:

```bash
cmd /c npm install
```

5. Generate the application key if needed:

```bash
php artisan key:generate
```

6. Run migrations and seed demo data:

```bash
php artisan migrate:fresh --seed
```

7. Start the application:

```bash
php artisan serve
cmd /c npm run dev
```

## Demo Credentials

All demo users use the password `BurnCenter@123`.

| Role | Email |
| --- | --- |
| Super Admin | `super.admin@kort.local` |
| Hospital Admin | `hospital.admin@kort.local` |
| Burn Center Manager / Department Head | `burn.manager@kort.local` |
| Store Manager / Inventory Officer | `store.manager@kort.local` |
| Biomedical Engineer | `biomedical@kort.local` |
| Nurse Supervisor | `nurse.supervisor@kort.local` |
| Staff Nurse / Clinical User | `staff.nurse@kort.local` |
| Pharmacist / Medical Store Staff | `pharmacist@kort.local` |
| Procurement Officer | `procurement@kort.local` |
| Accounts / Finance | `finance@kort.local` |
| Auditor | `auditor@kort.local` |

## API Snapshot Endpoints

These session-authenticated endpoints are available after login:

- `GET /api/v1/departments`
- `GET /api/v1/locations`
- `GET /api/v1/users`
- `GET /api/v1/roles`

## Testing

Primary validation commands:

```bash
php artisan route:list
php artisan migrate:fresh --seed
php artisan test
cmd /c npm run build
```

## Next Phases

- Phase 2: asset registry, tagging, barcode labels, issue and return flows
- Phase 3: inventory batches, FEFO issue logic, quarantine and expiry
- Phase 4: procurement approvals and goods receiving workflows
- Phase 5: maintenance, calibration, downtime, fit or unfit status
- Phase 6: alerts, scheduled checks, reports, exports, dashboards
- Phase 7: UI refinement, hardening, and broader test coverage
