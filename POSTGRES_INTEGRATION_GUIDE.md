# PostgreSQL Integration Guide for SGCS (Smart Governance & Civic Corporation System)

This guide provides step-by-step instructions to set up, connect, initialize, and test PostgreSQL database integration for the SGCS Spring Boot application.

---

## Architecture Overview

```
 ┌─────────────────────────────────────────────────────────────┐
 │                React 19 Frontend (Vite)                     │
 │   - Citizen Dashboard, Grievances, Proposals, Notices       │
 └──────────────────────────────┬──────────────────────────────┘
                                │ HTTP / REST API (Axios + JWT)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                Spring Boot Backend Server                   │
 │   - Port 5000 (routes: /api/auth, /api/complaints, etc.)    │
 └──────────────────────────────┬──────────────────────────────┘
                                │ Spring Data JPA / Hibernate
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                PostgreSQL Database (sgcs_db)                │
 │   - Tables: users, wards, complaints, proposals, notices    │
 └─────────────────────────────────────────────────────────────┘
```

---

## 🛠 Step 1: PostgreSQL Prerequisites & Credentials

1. Install PostgreSQL from [https://www.postgresql.org/download/](https://www.postgresql.org/download/) if not already installed.
2. Create the target database `sgcs_db`:
   ```sql
   CREATE DATABASE sgcs_db;
   ```
3. Open `backend/src/main/resources/application.properties` and update your PostgreSQL username and password:

```ini
spring.datasource.url=jdbc:postgresql://localhost:5432/sgcs_db
spring.datasource.username=postgres
spring.datasource.password=1102003
```

---

## 🚀 Step 2: Run the Spring Boot API Server & React Client

### 1. Start Backend Spring Boot API Server
In terminal 1:
```bash
cd backend
mvn spring-boot:run
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

- **Spring Boot Application**: `backend/src/main/java/com/sgcs/SgcsApplication.java`
- **Application Properties**: `backend/src/main/resources/application.properties`
- **Security & JWT Configuration**: `backend/src/main/java/com/sgcs/config/SecurityConfig.java`
- **Seed Cleanup Script**: `backend/src/main/resources/cleanup.sql`
- **Frontend Axios Client**: `src/services/api.ts`
