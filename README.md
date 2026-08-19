# Smart Governance & Civic Corporation System (SGCS) 🏛️

A comprehensive enterprise digital portal for urban governance, civic grievance reporting, community participatory proposals, ward notices, and multi-role administrative oversight.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [PostgreSQL Setup & Database Integration Steps](#postgresql-setup--database-integration-steps)
4. [Backend API Setup (Express + PostgreSQL)](#backend-api-setup-express--postgresql)
5. [Frontend Client Setup (React + Vite)](#frontend-client-setup-react--vite)
6. [Database Schema Architecture](#database-schema-architecture)
7. [API Endpoint Documentation](#api-endpoint-documentation)
8. [Multi-Role Accounts](#multi-role-accounts)

---

## 🌟 Overview

SGCS bridges citizens, ward councillors, field workers, and municipal administrators into a unified digital ecosystem featuring:
- **Grievance Reporting & Tracking**: Interactive submission with GPS coordinates, multi-image upload, timeline history, and worker dispatch.
- **Participatory Budgeting & Proposals**: Citizen community initiatives with upvote/downvote mechanics and councillor review.
- **Ward Public Notices**: Broadcast advisories (Emergency, Important, Normal) targeted by ward.
- **Real-Time Analytics & Admin Control**: Ward performance indicators, category distribution, and workforce dispatch.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Material UI (MUI 9), Emotion, Recharts, Axios, Lucide / MUI Icons
- **Backend**: Node.js, Express.js (ES Modules), CORS, Dotenv
- **Database**: PostgreSQL (pg pool driver), SQL DDL Schema, SQL Seed Scripts

---

## 🗄️ PostgreSQL Setup & Database Integration Steps

Follow these step-by-step instructions to integrate PostgreSQL with the SGCS application.

### Step 1: Install & Start PostgreSQL Database Server
1. Download & install PostgreSQL (v14+ recommended) from [postgresql.org](https://www.postgresql.org/download/).
2. During installation, set your superuser (`postgres`) password (e.g. `postgres` or custom).
3. Ensure the PostgreSQL service is running on default port `5432`.

### Step 2: Configure Environment Variables
Navigate to the `server/` folder and verify or edit the `.env` file:

```ini
# server/.env
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=sgcs_db

# Express Server Port
PORT=5000
```

*(Replace `PGPASSWORD` with your local PostgreSQL password if different)*

---

### Step 3: Run Automatic Database Initialization & Seeding Script
We have provided an automated script that connects to PostgreSQL, creates the database `sgcs_db` if it doesn't exist, executes table DDL schemas (`schema.sql`), and seeds initial test data (`seed.sql`).

Run the following command inside the `server/` directory:

```bash
cd server
npm run db:init
```

**Expected Output:**
```text
Connecting to PostgreSQL at localhost:5432 as user "postgres"...
Database "sgcs_db" created successfully!
Executing schema.sql...
Tables and indexes created successfully!
Executing seed.sql...
Seed data inserted successfully!

✅ SGCS PostgreSQL Database Initialization Complete!
```

---

### Step 4: Start Backend Express API Server
Run the backend server in development mode:

```bash
cd server
npm run dev
```

Or standard mode:
```bash
cd server
npm start
```

Verify backend health by opening `http://localhost:5000/api/health` in your browser. You should receive:
```json
{
  "status": "UP",
  "service": "SGCS PostgreSQL Backend API",
  "timestamp": "2026-08-17T12:00:00.000Z"
}
```

---

### Step 5: Start Frontend Vite Application
Open a new terminal window at the root directory (`sgcs_main`) and run:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. The application is now fully connected to your live PostgreSQL database!

*(Note: If the PostgreSQL backend server is offline, the frontend gracefully falls back to memory mock data so the app remains fully usable in offline demo mode).*

---

## 🏗️ Database Schema Architecture

The PostgreSQL database `sgcs_db` consists of 9 core tables:

1. **`users`**: User records with roles (`CITIZEN`, `COUNCILLOR`, `WORKER`, `ADMIN`) and ward assignments.
2. **`wards`**: Municipal ward demographics, population, councillor details, active & resolved complaint metrics.
3. **`complaints`**: Grievances with tracking numbers, priority levels, status (`PENDING`, `IN_PROGRESS`, `RESOLVED`, `REJECTED`), worker assignments, and media URLs.
4. **`complaint_timeline`**: Audit timeline events for each status transition and assignment.
5. **`complaint_comments`**: Cross-role discussion threads per complaint.
6. **`proposals`**: Community initiatives proposed by citizens with upvote/downvote tallies.
7. **`proposal_votes`**: One-vote-per-user tracking per proposal to prevent duplicate voting.
8. **`notices`**: Public ward notices with priority levels and expiration dates.
9. **`notifications`**: Citizen notification queue.

---

## 🔌 API Endpoint Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user by email or role
- `POST /api/auth/register` - Create new resident user in PostgreSQL
- `GET /api/auth/profile` - Fetch current user profile

### Complaints (`/api/complaints`)
- `GET /api/complaints` - Query complaints with filters (`status`, `category`, `ward`, `search`, `citizenId`, `assignedWorkerId`)
- `GET /api/complaints/:id` - Fetch complaint details with timeline & comments
- `POST /api/complaints` - File a new grievance
- `PATCH /api/complaints/:id/status` - Update complaint status & timeline
- `PATCH /api/complaints/:id/assign` - Assign field worker to complaint
- `POST /api/complaints/:id/comments` - Add official comment to complaint thread

### Community Proposals (`/api/proposals`)
- `GET /api/proposals` - Query community proposals by ward
- `POST /api/proposals` - Submit community initiative proposal
- `POST /api/proposals/:id/vote` - Upvote or downvote proposal
- `PATCH /api/proposals/:id/status` - Councillor approval/review status update

### Ward Notices (`/api/notices`)
- `GET /api/notices` - Fetch active ward advisories
- `POST /api/notices` - Publish new official notice

### Notifications (`/api/notifications`)
- `GET /api/notifications` - Fetch user notification queue
- `PATCH /api/notifications/:id/read` - Mark single notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read

### Admin & Analytics (`/api/admin`)
- `GET /api/admin/analytics` - System metrics, status counts & category distribution
- `GET /api/admin/users` - Fetch registered users
- `GET /api/admin/wards` - Fetch ward master list
- `POST /api/admin/wards` - Register new municipal ward

---

## 👥 Multi-Role Test Accounts

You can switch roles directly from the UI header or login using the following seeded credentials:

| Role | Name | Email | Default Ward |
| :--- | :--- | :--- | :--- |
| **Citizen** | Rahul Sharma | `rahul.citizen@sgcs.gov.in` | Ward 1 - Central Town |
| **Councillor** | Hon. Priya Verma | `priya.councillor@sgcs.gov.in` | Ward 1 - Central Town |
| **Worker** | Amit Kumar | `amit.worker@sgcs.gov.in` | Ward 1 - Central Town |
| **Administrator** | Dr. Rajesh Nair | `admin.rajesh@sgcs.gov.in` | All Wards |

---

*SGCS Smart Governance Project — Built with React & PostgreSQL Express Backend.*
