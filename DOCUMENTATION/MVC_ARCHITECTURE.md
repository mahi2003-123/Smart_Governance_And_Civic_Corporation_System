# SGCS Model-View-Controller (MVC) Architecture

The **Smart Governance & Civic Corporation System (SGCS)** is implemented following the enterprise **Model-View-Controller (MVC)** architectural pattern.

---

## 1. MVC Pattern Breakdown

```
       +-------------------------------------------------------+
       |               VIEW LAYER (Presentation)                |
       |  - React 19 Frontend Components (JSX/TSX & Material UI)|
       |  - JSON View Representations (DTOs)                    |
       +-------------------------------------------------------+
                                  |  ^
                HTTP Requests (JSON) |  | JSON Responses
                                  v  |
       +-------------------------------------------------------+
       |             CONTROLLER LAYER (Control Flow)           |
       |  - AuthController, ComplaintController, AdminController|
       |  - Request Mapping, Path Variable Extraction, Validation|
       +-------------------------------------------------------+
                                  |  ^
                 Delegates Tasks  |  | Returns Domain Objects
                                  v  |
       +-------------------------------------------------------+
       |             SERVICE LAYER (Business Logic)            |
       |  - AuthService, ComplaintService, AdminService         |
       |  - Business Rules (1-Councillor-per-ward constraint)  |
       +-------------------------------------------------------+
                                  |  ^
                   Data Access    |  | JPA Persistence Queries
                                  v  |
       +-------------------------------------------------------+
       |               MODEL LAYER (Data & State)              |
       |  - Domain Entities (User, Ward, Complaint, Proposal)   |
       |  - Data Repositories (UserRepository, WardRepository)  |
       |  - PostgreSQL Database Tables                          |
       +-------------------------------------------------------+
```

---

## 2. Layer Responsibilities

### 📦 1. MODEL LAYER (`com.sgcs.entity` & `com.sgcs.repository`)
- **Entities**: Represents the core data schema and JPA table mappings (`User`, `Ward`, `Complaint`, `Proposal`, `Notice`).
- **Repositories**: Manages persistence operations and database queries via Spring Data JPA interfaces (`UserRepository`, `WardRepository`, `ComplaintRepository`, `ProposalRepository`, `NoticeRepository`).

### ⚙️ 2. CONTROLLER LAYER (`com.sgcs.controller`)
- Exposes RESTful HTTP endpoints (`@RestController`).
- Routes client requests, handles request payload validation, and delegates processing to business services.
- **Controllers**:
  - `AuthController`: Handlers for `/api/auth/login` and `/api/auth/register`.
  - `ComplaintController`: Handlers for `/api/complaints`, `/api/complaints/{id}/status`, `/api/complaints/{id}/assign`.
  - `ProposalController`: Handlers for `/api/proposals`, `/api/proposals/{id}/vote`, `/api/proposals/{id}/review`.
  - `NoticeController`: Handlers for `/api/notices`.
  - `AdminController`: Handlers for `/api/admin/users`, `/api/admin/wards`, `/api/admin/analytics`.

### 🎨 3. VIEW LAYER (`src/pages`, `src/components`, `com.sgcs.dto`)
- **Data Transfer Objects (DTOs)**: Serves as serialized View Representations (`AuthDto`, `UserDto`, `ComplaintDto`, `ProposalDto`).
- **React Frontend Presentation**: User-facing interfaces (`CitizenDashboard`, `CouncillorDashboard`, `WorkerDashboard`, `AdminDashboard`).

---

## 3. Request Execution Flow Example (1-Councillor-per-Ward Rule)

1. **User Action (View)**: Super Admin fills registration form in `UserManagement.tsx` to add a Councillor to Ward 1.
2. **HTTP Dispatch**: React Axios service calls `POST /api/admin/users`.
3. **Controller Execution**: `AdminController.createUser()` receives the request body.
4. **Service Processing**: `AdminService.createUser()` queries `UserRepository` to check if Ward 1 already has an active Councillor.
5. **Model Enforcement**: If Ward 1 has a Councillor, a `RuntimeException` is thrown; otherwise, the new entity is persisted to PostgreSQL `users` table and `wards` table is updated.
6. **View Response**: Controller returns `HTTP 201 Created` or `HTTP 400 Bad Request` JSON representation back to the client.
