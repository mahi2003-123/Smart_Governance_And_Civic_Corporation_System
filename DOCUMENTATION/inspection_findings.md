# SGCS Project Inspection Findings

## 1. Frontend Architecture
The frontend is built using React with TypeScript and uses Vite as the build tool.
**Key findings:**
- **Routes and Roles:** Application routes (`AppRoutes.tsx`) are protected via `ProtectedRoute.tsx`. The system uses role-based access control with four roles: `CITIZEN`, `COUNCILLOR`, `WORKER`, `ADMIN`.
- **Pages Structure:** Divided into role-based modules:
  - `citizen/`: `CitizenDashboard`, `SubmitComplaint`, `ComplaintHistory`, `TrackComplaint`, etc.
  - `councillor/`: `CouncillorDashboard`, `ManageComplaints`, `ProposalReview`, etc.
  - `worker/`: `WorkerDashboard`, `AssignedTasks`, `CompletedTasks`.
  - `admin/`: `AdminDashboard`, `UserManagement`, `ComplaintMonitoring`, etc.
- **Login Locators:** Inputs have IDs like `login-email-input` and `login-password-input`.

## 2. Backend Architecture
The backend is a Spring Boot application using Maven.
**Key findings:**
- **Controllers:** Include `AuthController`, `ComplaintController`, `AdminController`, `NoticeController`, `NotificationController`, `ProposalController`.
- **Entities:** `User`, `Complaint`, `Notice`, `Notification`, `Proposal`, `SystemActivity`, `Ward`.
- **Security:** Standard JWT authentication structure (`JwtAuthenticationFilter`, `SecurityConfig`, `JwtUtils`).

## 3. Database
PostgreSQL is used as the database.
- **Tables discovered from entities:** `users`, `complaints`, `notices`, `notifications`, `proposals`, `system_activities`, `wards`.
- **Relationships:** E.g., `Complaint` has embedded `ComplaintComment` and `ComplaintTimelineItem`. `CitizenId` and `AssignedWorkerId` are stored as foreign keys directly in `Complaint`.

## 4. Application Status
- **Backend:** Checked backend startup using `mvn clean test`. Build is successful. Spring Boot backend can run without immediate crashes.
- **Frontend:** Built with Vite. `npm run dev` executes successfully. 
- **Defects / Issues to note:** As requested by the prompt, the "No Workers" issue will need to be specifically monitored during Councillor actions. Manual ward selection is confirmed for Phase 1.

## Summary for Selenium Test Setup
Based on the actual project files:
1. **Locators** can be fetched based on actual Material UI IDs (e.g., `#login-email-input`).
2. Authentication works via a standard POST to the auth API which returns a JWT.
3. The UI components are built using Material-UI which may generate dynamic classes, requiring precise locators (ID or XPath using attributes).
