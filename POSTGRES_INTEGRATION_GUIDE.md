# PostgreSQL Integration Guide for SGCS (Smart Governance & Civic Corporation System)

This guide provides step-by-step instructions to set up, connect, initialize, and test PostgreSQL database integration for the SGCS application.

---

## Architecture Overview

```
 ┌─────────────────────────────────────────────────────────────┐
 │                React 19 Frontend (Vite)                     │
 │   - Citizen Dashboard, Grievances, Proposals, Notices       │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTP / REST API (Axios)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                Express Backend Server                       │
 │   - Port 5000 (routes: auth, complaints, proposals, etc.)   │
 └──────────────────────────────┬──────────────────────────────┘
                                │ PostgreSQL Client Driver (pg)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                PostgreSQL Database (sgcs_db)                │
 │   - Tables: users, wards, complaints, timeline, comments,   │
 │     proposals, proposal_votes, notices, notifications       │
 └─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Step 1: PostgreSQL Prerequisites & Credentials

1. Install PostgreSQL from [https://www.postgresql.org/download/](https://www.postgresql.org/download/) if not already installed.
2. Verify PostgreSQL service is running on your machine (Default port: `5432`).
3. Open `server/.env` and update your PostgreSQL username and password:

```ini
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_postgres_password_here
PGDATABASE=sgcs_db
PORT=5000
```

---

## ⚡ Step 2: Initialize Database Schema & Seed Data

Run the database initialization script using Node.js:

```bash
cd server
npm run db:init
```

This command will:
1. Connect to PostgreSQL server.
2. Automatically create database `sgcs_db` if it doesn't already exist.
3. Run `server/db/schema.sql` to build 9 relational tables and indexes.
4. Run `server/db/seed.sql` to populate sample complaints, proposals, notices, wards, and users.

---

## 🚀 Step 3: Run the Live Server & Client

### 1. Start Backend Express API Server
In terminal 1:
```bash
cd server
npm run dev
```
- Server running at: `http://localhost:5000`
- API Health Check: `http://localhost:5000/api/health`

### 2. Start Frontend React Client
In terminal 2:
```bash
npm run dev
```
- Client running at: `http://localhost:5173`

---

## 📁 Key File Locations

- **Database DDL Schema**: `server/db/schema.sql`
- **Initial Data Seeds**: `server/db/seed.sql`
- **PostgreSQL Pool Connection**: `server/db/index.js`
- **Database Init Script**: `server/db/init.js`
- **Express Server**: `server/index.js`
- **API Routers**: `server/routes/` (`auth.js`, `complaints.js`, `proposals.js`, `notices.js`, `notifications.js`, `admin.js`)
- **Frontend Axios Client**: `src/services/api.ts`
