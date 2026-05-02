# KORT Hospital Operations Handbook

Version: 1.0  
Last Updated: May 2, 2026  
System: KORT Asset Management + Patient Management + Pharmacy Dispensing

## 1) Purpose
This handbook explains how to operate the complete KORT system, including:
- Demo account credentials
- Role-based access and responsibilities
- End-to-end workflows for Patient, Doctor, and Pharmacy operations
- Inventory, procurement, and asset operational guidance
- User creation and password management rules

---

## 2) System Access
- Web URL: `http://127.0.0.1:8000`
- Authentication: Email + Password
- Navigation is permission-aware (users only see authorized modules)

---

## 3) Demo Accounts
Default password for all demo users: `BurnCenter@123`

| Role | Name | Email |
|---|---|---|
| Super Admin | Amina Siddiqui | super.admin@kort.local |
| Hospital Admin | Dr. Haris Malik | hospital.admin@kort.local |
| Burn Center Manager / Department Head | Dr. Sana Qureshi | burn.manager@kort.local |
| Doctor / Consultant | Dr. Ahmed Raza | doctor@kort.local |
| Receptionist | Sara Javed | receptionist@kort.local |
| Pharmacist / Medical Store Staff | Farhan Yousaf | pharmacist@kort.local |
| Store Manager / Inventory Officer | Usman Riaz | store.manager@kort.local |
| Biomedical Engineer | Engr. Mahnoor Ali | biomedical@kort.local |
| Nurse Supervisor | Nadia Rehman | nurse.supervisor@kort.local |
| Staff Nurse / Clinical User | Rabia Iftikhar | staff.nurse@kort.local |
| Procurement Officer | Kiran Abbas | procurement@kort.local |
| Accounts / Finance | Umair Hassan | finance@kort.local |
| Auditor | Hiba Mansoor | auditor@kort.local |

Security note: Change default passwords before production use.

---

## 4) Who Can Add Users and Change Passwords

### Add New Users
Only roles with `users.create` can add users:
- Super Admin
- Hospital Admin

Path: `Administration > Users > Create`

### Change Other Users’ Passwords
Only roles with `users.update` can edit another user record and set/reset password:
- Super Admin
- Hospital Admin

Path: `Administration > Users > Edit`

### Change Own Password
Any logged-in user can change their own password:
- Path: `Profile > Password`

---

## 5) Role Access Summary (Operational)

## Super Admin
- Full access to all modules, roles, permissions, reports, and settings.

## Hospital Admin
- Full operational control across users, assets, inventory, procurement, patient, and pharmacy modules.

## Receptionist
- Patient-focused only:
  - Register/search/edit patient
  - Assign/change doctor before checkup
  - Create admissions
  - View and print patient prescription sheets
- No inventory/procurement/asset control routes.

## Doctor / Consultant
- Clinical workflow only:
  - View assigned patients
  - Create visit, diagnosis, prescription
  - Print prescription
  - Edit prescription within 24 hours (locked after 24 hours)
- No inventory/procurement/asset control routes.

## Pharmacist / Medical Store Staff
- Dispensing-only workflow:
  - Search patient prescription
  - Search medicine stock availability
  - Dispense medicine and print dispensing slip
  - Click **Done** to finalize dispensing and reduce inventory automatically
- Cannot create/edit/delete inventory master, batches, procurement, supplier, or stock adjustment records.

---

## 6) Module-Wise User Guide

## A) Patient Management System

### Key Features
- Auto patient number generation: `KORT-PAT-YYYY-000001`
- CNIC validation and duplicate prevention
- Doctor assignment at registration/admission
- Patient profile with full history
- Admissions, visits, diagnoses, prescriptions, documents

### Receptionist Workflow
1. Open `Patient Care > Patient Search`.
2. Search by CNIC / patient number / name.
3. If patient exists: open profile.
4. If new patient: register patient.
5. System auto-generates patient number.
6. Assign doctor and checkup details.
7. Create visit/admission record.
8. Patient appears in selected doctor queue.

### Doctor Workflow
1. Open `Patient Care > Doctor Queue`.
2. Open assigned patient.
3. Create/complete visit details.
4. Add diagnosis and follow-up.
5. Create prescription with medicine lines.
6. Print or download prescription.

Important:
- Prescription editing allowed within 24 hours only.
- If dispensing has started, prescription edit is blocked.

---

## B) Pharmacy Dispensing Module

Path: `Pharmacy > Prescription Lookup`

### Pharmacist Workflow
1. Search by CNIC / patient number / prescription number to load prescription.
2. Optionally search by medicine name/code to check stock availability.
3. Review prescribed items, available stock, and FEFO-ready batches.
4. Enter dispensing quantities.
5. Click **Done**.
6. System will:
   - Save dispensing record
   - Reduce inventory item quantity
   - Reduce batch available quantity
   - Increase issued quantity
   - Create inventory transaction (`pharmacy_dispensed`)
   - Update prescription status (`pending` / `partially_dispensed` / `fully_dispensed`)

### Dispensing Rules
- No expired stock
- No quarantined stock
- No damaged stock
- FEFO allocation enforced
- Cannot exceed remaining prescribed quantity
- Insufficient stock is blocked with validation error

---

## C) Inventory Management
Primary roles:
- Store Manager / Inventory Officer
- Hospital Admin / Super Admin

Capabilities include:
- Inventory categories and items
- Stock receipts/issues/returns/transfers/adjustments
- Batch-based tracking
- Ledger and scan tools

---

## D) Procurement Management
Primary roles:
- Procurement Officer
- Hospital Admin / Super Admin

Capabilities include:
- Supplier master
- Requisitions and approvals
- Purchase orders
- Goods receipts

---

## E) Asset Management
Primary roles:
- Biomedical Engineer
- Store Manager
- Hospital Admin / Super Admin

Capabilities include:
- Asset registry, categories, tags/labels
- Issue/return/transfer/status updates
- Asset history and scan

---

## F) Maintenance
Primary roles:
- Biomedical Engineer
- Hospital Admin

Capabilities include:
- Maintenance tickets
- Preventive/corrective status flow
- Calibration and fault tracking

---

## 7) Dashboards by Role
- Super/Hospital Admin: operational dashboards and alerts
- Receptionist: only patient operations actions
- Doctor: assigned-patient clinical workflow dashboard
- Pharmacist: dispensing-focused dashboard only (no low-stock/near-expiry analytics blocks)

---

## 8) Reports

### Pharmacy Reports (Authorized Admin Roles)
- Daily / weekly / monthly / quarterly / yearly views
- Filters: date range, medicine, patient, doctor, pharmacist, department, batch
- Export: PDF / CSV

### General Reports
- Access depends on role permissions (`reports.view`, `reports.export`)

---

## 9) Audit Logging
System logs security and operational events including:
- Login/logout
- Patient create/update
- Doctor assignment changes
- Admission and discharge
- Visit/diagnosis/prescription creation
- Prescription print/download
- Pharmacy search/view/dispense/print and failed dispensing
- Inventory transaction trail (including pharmacy dispensed events)

Path: `Security > Audit Logs` (authorized roles only)

---

## 10) Quick UAT Checklist

## Receptionist
- Can register patient and assign doctor
- Can search by CNIC/patient number/name
- Cannot access inventory/procurement pages directly (403)

## Doctor
- Can view assigned patient queue
- Can create diagnosis/prescription
- Can print prescription
- Cannot access inventory/procurement pages directly (403)

## Pharmacist
- Can search prescription and medicine availability
- Can click **Done** to dispense and reduce stock
- Cannot edit inventory master/procurement/supplier/adjustments (403)

## Admin
- Can manage users and reset passwords
- Can view exportable pharmacy reports (if authorized)

---

## 11) Production Readiness Recommendations
1. Replace all demo credentials.
2. Enforce strong password policy and periodic rotation.
3. Configure daily database backup and retention policy.
4. Enable HTTPS and production-grade session/cookie settings.
5. Configure centralized log retention and monitoring.
6. Review role matrix quarterly for least-privilege compliance.

---

## 12) Support Notes
If a user cannot see an expected menu:
1. Verify assigned role.
2. Verify role permissions in access control.
3. Refresh browser cache (`Ctrl+F5`).
4. Re-login after role changes.

