# Permission Matrix

The code source of truth lives in `app/Support/PermissionRegistry.php`. This document summarizes the role intent and module coverage.

## Roles

| Role | Core Coverage |
| --- | --- |
| Super Admin | Full system access across all modules |
| Hospital Admin | Administration, organization, approvals, operations oversight, reports, settings |
| Burn Center Manager / Department Head | Dashboard, departmental visibility, requests, approvals, maintenance visibility |
| Store Manager / Inventory Officer | Inventory operations, receiving, issues, adjustments, stock audit |
| Biomedical Engineer | Asset oversight, maintenance, calibration, downtime workflows |
| Nurse Supervisor | Department visibility, requests, issues and returns, fault reporting |
| Staff Nurse / Clinical User | Request initiation, item visibility, fault reporting |
| Pharmacist / Medical Store Staff | Inventory, expiry, quarantine, goods receiving |
| Procurement Officer | Suppliers, purchase requests, purchase orders, receiving coordination |
| Accounts / Finance | Financial visibility, purchase visibility, reports |
| Auditor | Read-only reporting and audit log visibility |

## Permission Groups

- Dashboard
- Users
- Roles & Permissions
- Departments
- Locations
- Assets
- Inventory
- Suppliers
- Procurement
- Biomedical & Maintenance
- Reports
- Audit Logs
- Settings

## Phase 1 Enforced Areas

- users
- roles
- departments
- locations
- audit logs
- dashboard access

## Examples

- only users with `users.create` can create staff accounts
- only users with `roles.update` can change permission assignments
- only users with `departments.update` can change burn center department metadata
- only users with `audit-logs.view` can open compliance logs
