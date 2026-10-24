# RentLink Backend REST API (MongoDB Native Driver)

A production-grade REST API backend built for the **RentLink** rental housing platform in Gilgit-Baltistan. Engineered with **Node.js**, **Express 4**, and the official **MongoDB Node.js Native Driver** (`mongodb`) without any ORM abstraction.

---

## 📋 Table of Contents
1. [Tech Stack & Architecture](#1-tech-stack--architecture)
2. [Directory Structure](#2-directory-structure)
3. [Environment Configuration](#3-environment-configuration)
4. [Prerequisites & Local MongoDB](#4-prerequisites--local-mongodb)
5. [Quick Start & Scripts](#5-quick-start--scripts)
6. [API Endpoints Reference](#6-api-endpoints-reference)
7. [Authentication & Security](#7-authentication--security)
8. [Automated Testing](#8-automated-testing)
9. [Database Inspection (MongoDB Compass)](#9-database-inspection-mongodb-compass)

---

## 1. Tech Stack & Architecture

- **Runtime & Modules:** Node.js (v18+) with native ES Modules (`"type": "module"`)
- **HTTP Framework:** [Express 4.21](https://expressjs.com/)
- **Database Driver:** Official [MongoDB Node.js Native Driver](https://www.mongodb.com/docs/drivers/node/current/) (`mongodb` v7.7+)
  - Centralized connection singleton with connection pooling (`maxPoolSize: 50`)
  - Automatic index creation and unique constraint verification on boot
  - Graceful connection termination on `SIGINT` and `SIGTERM`
  - Zero ORM / No Mongoose / No Prisma / No MySQL or SQLite dependencies
- **Authentication & Authorization:**
  - Password hashing with [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
  - Bearer token & HTTP-only Cookie authentication with [jsonwebtoken (JWT)](https://github.com/auth0/node-jsonwebtoken)
  - Role-Based Access Control (RBAC) middleware for `tenant`, `owner`, and `admin` roles
  - Parameterized queries and ObjectId sanitization to prevent NoSQL query injection
- **Input Validation:** Strict schema validation with [Zod](https://zod.dev/)
- **Automated Testing:** Built-in Node test runner (`node --test`) with [Supertest](https://github.com/ladjs/supertest)

---

## 2. Directory Structure

```
backend/
├── src/
│   ├── config/             # MongoDB connection singleton (db.js), constants, environment (env.js)
│   ├── controllers/        # Request handlers utilizing MongoDB native driver
│   │   ├── authController.js         # Register, login, profile, password, getMe
│   │   ├── propertyController.js     # Search, filter, CRUD, views, stats
│   │   ├── visitController.js        # Visit tour requests and status updates
│   │   ├── favoriteController.js     # Saved properties wishlist
│   │   ├── messageController.js      # Direct chat conversations & messages
│   │   ├── notificationController.js # User notifications feed
│   │   ├── transactionController.js  # Rent payments, owner earnings, admin financials
│   │   ├── adController.js           # Sponsored partner banners & click tracking
│   │   ├── reportController.js       # Trust & safety content moderation reports
│   │   ├── userController.js         # User management & landlord verification
│   │   └── adminController.js        # Dashboard overview KPIs, platform settings, audit logs
│   ├── db/                 # Native MongoDB database seed script (seed.js) & DB README
│   ├── middleware/         # Security & pipeline middleware
│   │   ├── auth.js                   # JWT verification and user resolution
│   │   ├── rbac.js                   # Role-based access control guard
│   │   ├── validate.js               # Zod request schema validator
│   │   └── errorHandler.js           # 404 handler and centralized error response
│   ├── routes/             # Modular Express routers
│   ├── utils/              # API response helpers, JWT sign/verify, logger
│   ├── validators/         # Zod schemas for properties, auth, visits
│   ├── app.js              # Express app setup, CORS, JSON parsers, route mounting
│   └── server.js           # HTTP listener entry point (connects DB and starts port 5000)
├── tests/
│   └── api.test.js         # 17 automated integration tests running against local MongoDB
├── .env.example            # Environment variables template
└── package.json            # Dependencies, test scripts, and seed scripts
```

---

## 3. Environment Configuration

Copy the template to create your local `.env`:
```bash
# Windows PowerShell
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Default configuration (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI="mongodb://127.0.0.1:27017"
MONGODB_DB_NAME="rentlink"
JWT_SECRET="rentlink_super_secret_jwt_key_2026_secure_random"
JWT_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:5175,http://localhost:5173,http://localhost:3000"
```

---

## 4. Prerequisites & Local MongoDB

1. **Node.js:** v18.0.0 or higher
2. **MongoDB Community Server:** Running on `127.0.0.1:27017`

### Checking the MongoDB Service on Windows
```powershell
Get-Service -Name MongoDB
```
If not running:
```powershell
Start-Service -Name MongoDB
```

---

## 5. Quick Start & Scripts

### 1. Install Backend Dependencies
```bash
npm install
```

### 2. Seed the MongoDB Database
Populate MongoDB with Gilgit-Baltistan listings, test accounts, platform settings, and indexes:
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
# or:
npm run dev:backend
```
The server starts at **http://localhost:5000/** and auto-reloads upon code modifications.

---

## 6. API Endpoints Reference

Base URL: `http://localhost:5000`

### Health Checks
- `GET /health` & `GET /api/health` — Returns service status and environment.

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account (`name`, `email`, `password`, `role`, `phone`, `district`, `city`, `area`).
- `POST /api/auth/login` — Sign in with email and password; returns JWT token, sets cookie, and returns user object.
- `POST /api/auth/logout` — Clears authentication cookie.
- `GET /api/auth/me` *(Authenticated)* — Returns current profile with related counts (properties, visits, favorites).
- `PUT /api/auth/profile` *(Authenticated)* — Updates profile metadata (phone, district, city, address, bio, avatar).
- `POST /api/auth/change-password` *(Authenticated)* — Updates password after verifying current password.

### Properties & Listings (`/api/properties`)
- `GET /api/properties` — Discover properties with pagination and filtering:
  - Query parameters: `type`, `district`, `city`, `area`, `minPrice`, `maxPrice`, `query`, `status`, `sort`, `page`, `limit`.
- `GET /api/properties/featured` — Returns top featured properties for homepage showcase.
- `GET /api/properties/stats` — Platform counts grouped by district and property type.
- `GET /api/properties/my` *(Owner/Admin)* — Returns listings owned by authenticated user with visit and favorite counts.
- `GET /api/properties/:id` — Full listing detail with owner profile and amenities.
- `GET /api/properties/:id/related` — Retrieves related properties in the same district or category.
- `POST /api/properties` *(Owner/Admin)* — Create a new listing with images and amenities.
- `PUT /api/properties/:id` *(Owner/Admin)* — Update existing listing (owner edits on approved properties re-trigger review).
- `DELETE /api/properties/:id` *(Owner/Admin)* — Deletes property and cascades favorites/visits.
- `PATCH /api/properties/:id/pause` *(Owner/Admin)* — Toggles listing status between approved and suspended.
- `POST /api/properties/:id/view` — Increments listing view counter.

### Visits & Tours (`/api/visits`)
- `POST /api/visits` *(Tenant)* — Schedules property visit with date, time, and note.
- `GET /api/visits/my` *(Authenticated)* — Returns user's visits (as tenant or owner).
- `GET /api/visits/all` *(Admin)* — Platform-wide visit logs.
- `GET /api/visits/:id` *(Authenticated)* — Detailed visit inspection record.
- `PATCH /api/visits/:id/status` *(Owner/Admin)* — Updates visit status (`approved`, `rejected`, `rescheduled`, `completed`).
- `DELETE /api/visits/:id` *(Tenant/Admin)* — Cancels scheduled visit.

### Favorites (`/api/favorites`)
- `GET /api/favorites` *(Tenant)* — List saved properties with full listing data.
- `POST /api/favorites/toggle` *(Tenant)* — Save / unsave a property ID.

### Messages & Threads (`/api/messages`)
- `GET /api/messages/conversations` *(Authenticated)* — List user's active chat conversations with last message preview.
- `GET /api/messages/conversations/:id` *(Authenticated)* — Get full conversation message history and marks unread messages as read.
- `POST /api/messages/open` *(Authenticated)* — Opens or retrieves an existing conversation thread for a property.
- `POST /api/messages/conversations/:id` *(Authenticated)* — Sends message and triggers recipient notification.
- `PATCH /api/messages/conversations/:id/read` *(Authenticated)* — Explicitly marks thread messages as read.

### Notifications (`/api/notifications`)
- `GET /api/notifications` *(Authenticated)* — Returns user notification feed and unread badge count.
- `PATCH /api/notifications/:id/read` *(Authenticated)* — Marks notification as read.
- `POST /api/notifications/read-all` *(Authenticated)* — Marks all notifications as read.
- `DELETE /api/notifications/:id` *(Authenticated)* — Removes notification item.

### Financials & Transactions (`/api/transactions`)
- `GET /api/transactions/my` *(Authenticated)* — User transactions ledger.
- `GET /api/transactions/owner-summary` *(Owner/Admin)* — Aggregated owner earnings, platform fees, and gross rent.
- `GET /api/transactions/admin-summary` *(Admin)* — Platform-wide revenue metrics.
- `POST /api/transactions` *(Authenticated)* — Processes rent transaction with 5% platform fee calculation.
- `PATCH /api/transactions/:id/payout` *(Admin)* — Updates payout status (`pending`, `eligible`, `processed`).

### Advertisements (`/api/advertisements`)
- `GET /api/advertisements/active` — Public active sponsored banners within valid date range.
- `GET /api/advertisements/all` *(Admin)* — List all ad campaigns.
- `POST /api/advertisements` *(Admin)* — Create ad campaign.
- `PUT /api/advertisements/:id` *(Admin)* — Update ad campaign.
- `POST /api/advertisements/:id/interact` — Tracks banner impression or click.
- `DELETE /api/advertisements/:id` *(Admin)* — Deletes ad.

### Moderation & Reports (`/api/reports`)
- `POST /api/reports` *(Authenticated)* — File a content moderation report.
- `GET /api/reports` *(Admin)* — List moderation reports with optional status filter.
- `PATCH /api/reports/:id` *(Admin)* — Update report resolution and status.

### Users & Landlords (`/api/users`)
- `GET /api/users` *(Admin)* — Search, filter, and paginate platform users.
- `GET /api/users/owners` *(Admin)* — List all registered property owners with property counts.
- `GET /api/users/:id` — Public profile of user and their approved properties.
- `PATCH /api/users/:id/status` *(Admin)* — Activate or suspend user account.
- `PATCH /api/users/:id/verification` *(Admin)* — Update landlord verification (`unverified`, `pending`, `verified`, `rejected`).

### Admin Portal (`/api/admin`)
- `GET /api/admin/overview` *(Admin)* — System KPI metrics.
- `GET /api/admin/counts` *(Admin)* — Real-time badge counts.
- `GET /api/admin/settings` *(Admin)* — Global platform settings (fee %, auto-approve flag).
- `POST /api/admin/settings` *(Admin)* — Updates platform configuration and creates audit log.
- `GET /api/admin/audit-logs` *(Admin)* — Administrative audit trail logs.

---

## 7. Authentication & Security

1. **Password Security:** All passwords hashed using `bcryptjs` with salt factor 10.
2. **Session / JWT Tokens:** Issued upon login via `jsonwebtoken`, containing `{ id, email, role }` with 7-day expiration.
3. **Dual Token Delivery:** Tokens returned in response JSON and set as secure, HTTP-only cookies (`SameSite: Lax`).
4. **RBAC Guard (`src/middleware/rbac.js`):** Enforces user roles (`tenant`, `owner`, `admin`) on sensitive endpoints.
5. **NoSQL Injection Protection:** Query strings are sanitized, inputs validated by Zod schemas, and IDs processed through `toIdQuery(id)`.

---

## 8. Automated Testing

The backend includes a comprehensive automated test suite testing the native MongoDB implementation:

```bash
npm test
```

### Passing Test Output:
```
[INFO] - ✓ MongoDB connected successfully to database "rentlink" via native driver 
[INFO] - ✓ MongoDB indexes verified and established successfully. 
▶ RentLink Backend API Test Suite (MongoDB Native)
  ✔ GET /health returns 200 OK
  ✔ POST /api/auth/login authenticates seeded tenant user
  ✔ POST /api/auth/login authenticates canonical tenant@rentlink.pk with Password123!
  ✔ POST /api/auth/login authenticates seeded owner user
  ✔ POST /api/auth/login authenticates canonical owner@rentlink.pk with Password123!
  ✔ POST /api/auth/login authenticates seeded admin user
  ✔ POST /api/auth/login authenticates canonical admin@rentlink.pk with Admin123!
  ✔ GET /api/auth/me returns authenticated user details
  ✔ GET /api/properties returns list of approved properties from MongoDB
  ✔ GET /api/properties/:id returns single property details
  ✔ GET /api/properties/stats returns analytics statistics
  ✔ GET /api/advertisements/active returns active ads
  ✔ POST /api/favorites/toggle toggles favorite property for authenticated tenant
  ✔ GET /api/notifications returns user notification list
  ✔ GET /api/visits/my returns visit requests for tenant
  ✔ GET /api/admin/overview returns dashboard metrics for admin
  ✔ GET /api/admin/settings returns system platform settings
✔ RentLink Backend API Test Suite (MongoDB Native) (17 tests passing, 0 failing)
```

---

## 9. Database Inspection (MongoDB Compass)

1. Open **MongoDB Compass**.
2. Connect to `mongodb://127.0.0.1:27017`.
3. Open the **`rentlink`** database.
4. Inspect the 12 collections (`users`, `properties`, `visitRequests`, `transactions`, etc.).
5. For complete schema specifications, see [backend/src/db/README.md](file:///c:/Users/uddin/Downloads/sq/backend/src/db/README.md).
