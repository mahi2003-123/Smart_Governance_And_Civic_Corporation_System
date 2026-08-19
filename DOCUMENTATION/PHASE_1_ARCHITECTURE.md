# SGCS (Smart Governance & Civic Corporation System) - Phase 1 System Architecture

## 1. Executive Summary & Overview
The **Smart Governance & Civic Corporation System (SGCS)** is a modern, enterprise-grade civic management portal designed to streamline municipal governance, grievance redressal, community proposals, and field operations across municipal wards.

Phase 1 focuses on establishing a clean, robust, and scalable foundation using a **React + Material UI + TypeScript** frontend communicates via an isolated **Axios Service Layer** designed for direct integration with a **Spring Boot REST API** and **PostgreSQL** database.

---

## 2. System Architecture & Component Mapping

```
                    +-------------------------------------------------------+
                    |           React 19 + TypeScript + MUI Frontend        |
                    +-------------------------------------------------------+
                                               |
                                               v
                    +-------------------------------------------------------+
                    |             Axios Service Layer (src/services)         |
                    | (authService, complaintService, proposalService, etc) |
                    +-------------------------------------------------------+
                                               |
                                    [ HTTP / REST API JSON ]
                                               |
                                               v
                    +-------------------------------------------------------+
                    |          Spring Boot 3.x REST API (Future Backend)    |
                    | (Controller -> Service -> Repository -> JPA Entities) |
                    +-------------------------------------------------------+
                                               |
                                               v
                    +-------------------------------------------------------+
                    |                 PostgreSQL 16 Database                |
                    | (users, wards, complaints, proposals, notices, etc)   |
                    +-------------------------------------------------------+
```

---

## 3. Frontend Architecture (`src/`)

- **`components/`**
  - **`common/`**: Reusable UI elements (`StatusBadge`, `WardSelector`, `CustomButton`, `CustomTextField`, `LoadingSpinner`, `EmptyState`, `CustomSnackbar`, `AlertDialog`).
  - **`auth/`**: Authentication UI components (`AuthCard`, `AuthBackground`, `AuthHeroCard`, `PasswordField`).
  - **`cards/`**: Modular display cards (`StatCard`, `WelcomeCard`, `ComplaintCard`, `ProposalCard`, `NoticeCard`).
  - **`forms/`**: Standardized input forms (`ComplaintForm`, `ProposalForm`).
  - **`layout/`**: Page structure templates (`MainLayout`, `Navbar`, `Sidebar`, `Footer`, `HeaderBreadcrumb`).
  - **`tables/`**: Responsive data grids (`ComplaintTable`).
  - **`modals/`**: Action dialogs (`AssignWorkerModal`).
- **`pages/`**
  - **`auth/`**: `Login.tsx`, `Register.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`, `EmailVerification.tsx`.
  - **`citizen/`**: `CitizenDashboard.tsx`, `SubmitComplaint.tsx`, `ComplaintHistory.tsx`, `ComplaintDetails.tsx`, `TrackComplaint.tsx`, `Proposals.tsx`, `Notices.tsx`, `Profile.tsx`.
  - **`councillor/`**: `CouncillorDashboard.tsx`, `ManageComplaints.tsx`, `ProposalReview.tsx`, `Announcements.tsx`, `CouncillorReports.tsx`.
  - **`worker/`**: `WorkerDashboard.tsx`, `AssignedTasks.tsx`, `CompletedTasks.tsx`.
  - **`admin/`**: `AdminDashboard.tsx`, `UserManagement.tsx`, `WardManagement.tsx`, `ComplaintMonitoring.tsx`, `SystemReports.tsx`.
- **`services/`**
  - Encapsulates all Axios HTTP traffic (`api.ts`, `authService.ts`, `complaintService.ts`, `proposalService.ts`, `noticeService.ts`, `notificationService.ts`, `adminService.ts`).
- **`types/`**
  - Strictly typed domain models (`User`, `Ward`, `Complaint`, `CommunityProposal`, `WardNotice`, `NotificationItem`, `CivicAnalytics`).

---

## 4. Phase 1 Functional Scope & Boundaries

### ✅ Phase 1 Features Included:
1. **Public Citizen Registration**: Only citizens can publicly register. Councillor and Worker accounts are provisioned exclusively by Super Admin.
2. **Role-Based Access Control (RBAC)**: Enforced via `ProtectedRoute.tsx` for `CITIZEN`, `COUNCILLOR`, `WORKER`, and `ADMIN`.
3. **Manual Ward Selection**: Uses `<WardSelector />` dropdowns across all forms.
4. **1 Councillor per Ward Rule**: Strict constraint prohibiting more than one active Councillor per municipal ward.
5. **Grievance Redressal Lifecycle**:
   - Citizen submits complaint -> Councillor manually sets priority & assigns field worker -> Field worker completes task & uploads completion photo -> Citizen leaves resolution feedback.
6. **Community Proposals & Ward Notices**: Citizens upvote proposals; Councillors review, approve, or reject proposals and broadcast notices.

### 🚫 Phase 2 Boundaries Excluded in Phase 1:
- GPS / Geolocation auto-detection
- Photo EXIF GPS extraction
- AI-based complaint priority scoring
- AI automated duplicate complaint detection
- GeoJSON GIS polygon matching

---

## 5. PostgreSQL Schema Mapping

| Entity | Table Name | Key Columns |
| :--- | :--- | :--- |
| **User** | `users` | `id`, `full_name`, `email`, `password_hash`, `phone`, `role`, `ward`, `created_at` |
| **Ward** | `wards` | `id`, `ward_number`, `name`, `councillor_name`, `councillor_email`, `population`, `active_complaints`, `resolved_complaints` |
| **Complaint** | `complaints` | `id`, `tracking_number`, `title`, `category`, `priority`, `description`, `ward`, `location_address`, `status`, `citizen_id`, `assigned_worker_id`, `images`, `completion_image` |
| **Proposal** | `proposals` | `id`, `title`, `category`, `description`, `ward`, `author_name`, `upvotes`, `downvotes`, `status`, `councillor_notes` |
| **Notice** | `notices` | `id`, `title`, `content`, `ward`, `priority`, `published_by`, `publish_date`, `expiry_date` |

---

## 6. Verification Status
- **TypeScript**: Passed (`0` errors with `npx tsc --noEmit`)
- **Backend API Integration**: Operational on `http://localhost:5000/api`
- **Database Connectivity**: Connected to PostgreSQL database `sgcs_db`
