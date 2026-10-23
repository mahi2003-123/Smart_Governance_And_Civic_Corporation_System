# Smart Governance & Civic Corporation System (SGCS) 🏛️

A comprehensive enterprise digital portal for urban governance, civic grievance reporting, community participatory proposals, ward notices, and multi-role administrative oversight.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Local Development](#local-development)
4. [Deployment](#deployment)
5. [Render Environment Variables](#render-environment-variables)
6. [Vercel Environment Variables](#vercel-environment-variables)
7. [API Endpoint Documentation](#api-endpoint-documentation)
8. [Multi-Role Accounts](#multi-role-accounts)

---

## 🌟 Overview

SGCS bridges citizens, ward councillors, field workers, and municipal administrators into a unified digital ecosystem featuring:
- **Grievance Reporting & Tracking**: Interactive submission with multi-image upload, timeline history, and worker dispatch.
- **Participatory Budgeting & Proposals**: Citizen community initiatives with upvote/downvote mechanics and councillor review.
- **Ward Public Notices**: Broadcast advisories (Emergency, Important, Normal) targeted by ward.
- **Real-Time Analytics & Admin Control**: Ward performance indicators, category distribution, and workforce dispatch.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Material UI (MUI 9), Emotion, Recharts, Axios, Lucide / MUI Icons — hosted on **Vercel**
- **Backend**: Java 17, Spring Boot 3.2.3, Spring Security (JWT RBAC), Spring Data JPA, Hibernate — hosted on **Render** (Docker)
- **AI Service**: FastAPI, scikit-learn — hosted on **Render** (Python)
- **Database**: PostgreSQL (`sgcs_db`) — hosted on **Neon** (or Render free-tier Postgres)

> [!NOTE]
> **AI Service & Model Compatibility**: Exact versions in `ai_service/requirements.txt` (`scikit-learn==1.5.2`, `numpy==1.26.4`, `pandas==2.2.3`, `joblib==1.4.2`) strictly match the environment used to train the `.joblib` models. Do not upgrade these versions without retraining the models (`python train.py`).

---

## 🗄️ Local Development

### Step 1: Start PostgreSQL

```bash
# Create local DB
createdb sgcs_db
```

### Step 2: Start Spring Boot Backend

```powershell
# Windows PowerShell
$env:DB_PASSWORD="your_postgres_password"
$env:JWT_SECRET="any_long_secret_for_local_dev"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_PASSWORD="adminpassword"
cd backend
mvn spring-boot:run
```

The backend starts on port **5000**. Health check: `GET http://localhost:5000/api/health`

### Step 3: Start AI Service

```bash
cd ai_service
pip install -r requirements.txt
uvicorn app:app --host 127.0.0.1 --port 8000
```

### Step 4: Start Frontend

```bash
# Root directory
npm install
npm run dev
```

Open `http://localhost:5173`. Set `VITE_API_BASE_URL=http://localhost:5000` in `.env.local` (or omit it — the app auto-detects localhost).

---

## 🚀 Deployment

| Service | Platform | Config |
|---------|----------|--------|
| Frontend | Vercel | `vercel.json`, Vercel dashboard env vars |
| Backend  | Render  | `render.yaml`, Docker — `backend/Dockerfile` |
| AI Service | Render | `render.yaml`, Python runtime |
| Database | Neon / Render Postgres | See `render.yaml` |

The `render.yaml` at the repo root declares the backend and AI services. The frontend is **not** in `render.yaml` — deploy it on Vercel separately.

---

## 🔑 Render Environment Variables

**Set these in the Render dashboard** (never commit real values). The backend service requires:

| Variable | Required? | Description |
|----------|-----------|-------------|
| `DB_HOST` | ✅ (auto) | Injected by Render from database config |
| `DB_PORT` | ✅ (auto) | Injected by Render from database config |
| `DB_NAME` | ✅ (auto) | Injected by Render from database config |
| `DB_USERNAME` | ✅ (auto) | Injected by Render from database config |
| `DB_PASSWORD` | ✅ (auto) | Injected by Render from database config |
| `JWT_SECRET` | ✅ | Minimum 32 bytes (256 bits) random secret key — use Render's **Generate** button |
| `AI_INTERNAL_KEY` | ✅ | Shared secret between backend & AI service — generate on AI service, copy to backend |
| `AI_SERVICE_URL` | ✅ | URL of AI service, e.g. `https://sgcs-ai-service.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | ✅ | Comma-separated frontend domains, e.g. `https://sgcs.vercel.app` |
| `ADMIN_EMAIL` | ✅ | Email address for the first admin account (auto-created on startup) |
| `ADMIN_PASSWORD` | ✅ | Password for the first admin account (min 12 chars in production) |
| `DATA_SEEDING_ENABLED` | Optional | `false` (default) — keeps demo data seeding strictly off |
| `FIREBASE_ENABLED` | Optional | `true` to enable push notifications (requires credentials) |
| `FIREBASE_CREDENTIALS_JSON` | Optional | Paste the Firebase service-account JSON as a single-line env var |

---

## 🌐 Vercel Environment Variables

Set in the **Vercel project dashboard** under Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | `https://sgcs-backend.onrender.com` (your Render backend URL) |

All Firebase `VITE_FIREBASE_*` vars are optional (only needed for browser push notifications).

---

## 🔌 API Endpoint Documentation

### Health (`/api`)
- `GET /api/health` — Returns `{"status":"UP"}`. No auth required. Used by Render health checks.

### Authentication (`/api/auth`)
- `POST /api/auth/login` — Authenticate user by email and password (returns signed JWT)
- `POST /api/auth/register` — Register a new account (stores BCrypt hashed password)

### Complaints (`/api/complaints`)
- `GET /api/complaints` — Query complaints with filters (`status`, `ward`, `citizenId`)
- `GET /api/complaints/:id` — Fetch complaint details
- `POST /api/complaints` — Submit a new complaint
- `PATCH /api/complaints/:id/status` — Update complaint status
- `POST /api/complaints/:id/assign` — Assign field worker to complaint
- `DELETE /api/complaints` — Admin-only bulk delete

### Community Proposals (`/api/proposals`)
- `GET /api/proposals` — Query community proposals by ward
- `POST /api/proposals` — Submit community initiative proposal
- `POST /api/proposals/:id/vote` — Upvote or downvote proposal
- `PATCH /api/proposals/:id/review` — Councillor approval/review status update

### Ward Notices (`/api/notices`)
- `GET /api/notices` — Fetch active ward advisories
- `POST /api/notices` — Publish new official notice

### Admin & Analytics (`/api/admin`)
- `GET /api/admin/analytics` — System metrics & category distribution
- `GET /api/admin/users` — Fetch registered users (ADMIN only)
- `POST /api/admin/users` — Create official user account (ADMIN only)
- `GET /api/admin/wards` — Fetch ward master list
- `POST /api/admin/wards` — Register new municipal ward

---

## 👥 Multi-Role Accounts

Register accounts through the Signup page or via the Admin Dashboard. Available roles:
- **CITIZEN**
- **COUNCILLOR**
- **WORKER**
- **ADMIN** (seeded from `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars on first startup)

---

*SGCS Smart Governance Project — Built with React & Spring Boot Backend.*
