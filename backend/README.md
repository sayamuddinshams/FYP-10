# RentLink Backend API

A production-grade REST API backend built for the **RentLink** rental housing platform in Gilgit-Baltistan. Powered by **Node.js**, **Express**, **Prisma ORM**, and **SQLite**.

---

## Tech Stack & Architecture

- **Runtime & Framework:** Node.js (ES Modules) with [Express 4](https://expressjs.com/)
- **Database & ORM:** [Prisma ORM 5](https://www.prisma.io/) with **SQLite** (`prisma/dev.db` for zero-configuration local development; drop-in upgradeable to PostgreSQL via `schema.prisma`)
- **Authentication & Security:** 
  - Password hashing with [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (salt factor 12)
  - Bearer token / Cookie authentication with [jsonwebtoken (JWT)](https://github.com/auth0/node-jsonwebtoken)
  - Role-Based Access Control (RBAC) middleware for `tenant`, `owner`, and `admin` roles
  - Cross-Origin Resource Sharing (CORS) with credentials support
- **Data Validation:** Schema validation powered by [Zod](https://zod.dev/)
- **Automated Testing:** Built-in Node test runner (`node --test`) paired with [Supertest](https://github.com/ladjs/supertest)

---

## Directory Structure

```
backend/
├── prisma/
│   ├── schema.prisma       # Prisma data model (Users, Properties, Visits, Reviews, Messages, etc.)
│   ├── seed.js             # Seed script with real Gilgit-Baltistan listings and test accounts
│   └── dev.db              # SQLite local database (generated, git-ignored)
├── src/
│   ├── config/             # Environment variables, constants, and Prisma database client
│   ├── controllers/        # Request handlers (auth, properties, visits, messages, admin, etc.)
│   ├── middleware/         # Auth (JWT), RBAC, error handling, request validator
│   ├── routes/             # Modular Express routers
│   ├── utils/              # API response helpers, JWT token signing/verification, logger
│   ├── validators/         # Zod validation schemas
│   ├── app.js              # Express app setup and middleware pipeline
│   └── server.js           # Server entry point (starts HTTP listener)
├── tests/
│   └── api.test.js         # Integration test suite covering auth, listings, stats, and admin
├── .env.example            # Example environment configuration template
└── package.json            # Backend scripts and dependencies
```

---

## Quick Start Guide

### 1. Environment Configuration

Copy the sample environment file to `.env`:

```bash
# From workspace root
copy backend\.env.example backend\.env
# or in Linux/macOS: cp backend/.env.example backend/.env
```

Default `.env` settings:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="file:./dev.db"
JWT_SECRET="rentlink_super_secret_jwt_key_2026_secure_random"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5175,http://localhost:5173,http://localhost:3000"
```

### 2. Install Dependencies

From the repository root:
```bash
npm install
```

### 3. Initialize & Seed Database

Generate the Prisma Client and populate the SQLite database with Gilgit-Baltistan districts, verified properties, and default user accounts:

```bash
# From repository root:
npm run backend:seed

# Or inside the backend/ directory:
cd backend
npm run prisma:generate
npm run seed
```

### 4. Run the Backend Server

```bash
# From repository root (starts backend with file-watch on http://localhost:5000):
npm run dev:backend

# Or run both frontend and backend concurrently:
npm run dev          # Starts Vite frontend on http://localhost:5175
npm run dev:backend  # Starts Express backend on http://localhost:5000
```

---

## Seed Accounts & Test Credentials

The seed script creates ready-to-test accounts across all platform roles:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Tenant** | `tenant@rentlink.pk` | `Password123!` | Browse, schedule visits, favorite listings, direct message owners |
| **Owner / Agent** | `owner@rentlink.pk` | `Password123!` | Add/edit properties, manage visit requests, view earnings & inquiries |
| **Admin** | `admin@rentlink.pk` | `Admin123!` | Moderate properties, manage users, platform analytics, system settings |

---

## API Endpoints Reference

Base URL: `http://localhost:5000`

### Health Checks
- `GET /health` & `GET /api/health` — Service status, timestamp, and environment

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `role`, `phone`)
- `POST /api/auth/login` — Login with email and password; returns JWT token and user profile
- `POST /api/auth/logout` — Invalidate user session
- `GET /api/auth/me` — Retrieve currently authenticated user profile
- `PUT /api/auth/profile` — Update user profile details

### Properties & Listings (`/api/properties`)
- `GET /api/properties` — List verified properties with filtering (`district`, `type`, `minPrice`, `maxPrice`, `search`)
- `GET /api/properties/stats` — Platform-wide listing counts, districts, and pricing metrics
- `GET /api/properties/featured` — Featured listings on home hero
- `GET /api/properties/:id` — Property details including amenities, host info, and verified reviews
- `POST /api/properties` *(Owner/Admin)* — Create a new property listing with GPS coordinates
- `PUT /api/properties/:id` *(Owner/Admin)* — Update existing listing
- `DELETE /api/properties/:id` *(Owner/Admin)* — Remove listing

### Visits & Tours (`/api/visits`)
- `POST /api/visits` *(Tenant)* — Request an in-person or video property visit
- `GET /api/visits/my` — Retrieve visits requested by or assigned to the current user
- `PATCH /api/visits/:id/status` *(Owner/Admin)* — Accept, reject, or mark visit completed

### Messages & Threads (`/api/messages`)
- `GET /api/messages/conversations` — List active conversation threads
- `GET /api/messages/conversations/:id` — Get messages within a thread
- `POST /api/messages` — Send a direct message
- `PATCH /api/messages/:id/read` — Mark message as read

### Favorites (`/api/favorites`)
- `GET /api/favorites` *(Tenant)* — List saved properties
- `POST /api/favorites/toggle` *(Tenant)* — Save / unsave a property

### Advertisements (`/api/advertisements`)
- `GET /api/advertisements/active` — Retrieve currently active sponsored banner ads

### Notifications (`/api/notifications`)
- `GET /api/notifications` — List user notifications
- `PATCH /api/notifications/:id/read` — Mark notification as read
- `POST /api/notifications/read-all` — Mark all notifications as read

### Admin Portal (`/api/admin`)
- `GET /api/admin/overview` *(Admin)* — Aggregate metrics (total users, listings, visits, revenue)
- `GET /api/admin/users` *(Admin)* — Search and manage user accounts
- `PATCH /api/admin/properties/:id/status` *(Admin)* — Approve, reject, or flag listings
- `GET /api/admin/settings` *(Admin)* — System platform configuration and flags

---

## Running Automated Tests

Run the integration test suite (covering authentication, property querying, role enforcement, analytics, and favorites):

```bash
# From workspace root
npm run backend:test

# Or from backend/ directory
npm test
```
