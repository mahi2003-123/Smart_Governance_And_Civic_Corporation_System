# Smart Governance & Civic Corporation System (SGCS) 🏛️

A comprehensive enterprise digital portal for urban governance, civic grievance reporting, community participatory proposals, ward notices, and multi-role administrative oversight.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [PostgreSQL Setup & Spring Boot Backend](#postgresql-setup--spring-boot-backend)
4. [Frontend Client Setup (React + Vite)](#frontend-client-setup-react--vite)
5. [API Endpoint Documentation](#api-endpoint-documentation)
6. [Multi-Role Accounts](#multi-role-accounts)

---

## 🌟 Overview

SGCS bridges citizens, ward councillors, field workers, and municipal administrators into a unified digital ecosystem featuring:
- **Grievance Reporting & Tracking**: Interactive submission with multi-image upload, timeline history, and worker dispatch.
- **Participatory Budgeting & Proposals**: Citizen community initiatives with upvote/downvote mechanics and councillor review.
- **Ward Public Notices**: Broadcast advisories (Emergency, Important, Normal) targeted by ward.
- **Real-Time Analytics & Admin Control**: Ward performance indicators, category distribution, and workforce dispatch.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Material UI (MUI 9), Emotion, Recharts, Axios, Lucide / MUI Icons
- **Backend**: Java 17, Spring Boot 3.2.3, Spring Security (JWT RBAC), Spring Data JPA, Hibernate
- **Database**: PostgreSQL (`sgcs_db`)

---

## 🗄️ PostgreSQL Setup & Spring Boot Backend

### Step 1: Install & Start PostgreSQL Database Server
1. Download & install PostgreSQL (v14+ recommended) from [postgresql.org](https://www.postgresql.org/download/).
2. Create the target database `sgcs_db` using psql or PgAdmin:
   ```sql
   CREATE DATABASE sgcs_db;
   ```

### Step 2: Configure Environment / `application.properties`
Navigate to `backend/src/main/resources/application.properties` and verify your database credentials:

```ini
# Server Configuration
server.port=5000
server.servlet.context-path=/

# PostgreSQL Datasource Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/sgcs_db
spring.datasource.username=postgres
spring.datasource.password=1102003
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA & Hibernate Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT Configuration
sgcs.app.jwtSecret=SGCSSecretKeyForJWTAuthenticationSmartGovernanceCivicSystem2026SecureKey
sgcs.app.jwtExpirationMs=86400000
```

### Step 3: Run Spring Boot Backend API Server
Navigate to the `backend/` directory and execute Maven to compile and start the backend service:

```bash
cd backend
mvn spring-boot:run
```

The Spring Boot backend will start on port `5000`. Verify health check:
`GET http://localhost:5000/api/health`

---

## 💻 Frontend Client Setup (React + Vite)

Open a terminal at the root directory (`sgcs_main`) and run:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser. The application connects to your local Spring Boot API server on port 5000.

---

## 🔌 API Endpoint Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Authenticate user by email and password (returns signed JWT)
- `POST /api/auth/register` - Register a new account (stores BCrypt hashed password)

### Complaints (`/api/complaints`)
- `GET /api/complaints` - Query complaints with filters (`status`, `ward`, `citizenId`)
- `GET /api/complaints/:id` - Fetch complaint details
- `POST /api/complaints` - Submit a new complaint
- `PATCH /api/complaints/:id/status` - Update complaint status (valid values: PENDING, IN_PROGRESS, RESOLVED, REJECTED)
- `POST /api/complaints/:id/assign` - Assign field worker to complaint
- `DELETE /api/complaints` - Restrictive admin endpoint to clear complaints (requires `{"confirm": "DELETE_ALL"}`)

### Community Proposals (`/api/proposals`)
- `GET /api/proposals` - Query community proposals by ward
- `POST /api/proposals` - Submit community initiative proposal
- `POST /api/proposals/:id/vote` - Upvote or downvote proposal
- `PATCH /api/proposals/:id/review` - Councillor approval/review status update

### Ward Notices (`/api/notices`)
- `GET /api/notices` - Fetch active ward advisories
- `POST /api/notices` - Publish new official notice

### Admin & Analytics (`/api/admin`)
- `GET /api/admin/analytics` - System metrics & category distribution
- `GET /api/admin/users` - Fetch registered users (ADMIN only)
- `POST /api/admin/users` - Create official user account (ADMIN only)
- `GET /api/admin/wards` - Fetch ward master list
- `POST /api/admin/wards` - Register new municipal ward

---

## 👥 Multi-Role Test Accounts

Register accounts directly through the Signup page or create accounts via the Admin Dashboard. Available roles:
- **CITIZEN**
- **COUNCILLOR**
- **WORKER**
- **ADMIN**

---

*SGCS Smart Governance Project — Built with React & Spring Boot Backend.*
