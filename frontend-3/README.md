# RentLink Frontend Application (Alpine Sanctuary Edition)

A modern, high-performance rental housing marketplace and property management web application built for the **Gilgit-Baltistan** region. Designed with an editorial **Alpine Sanctuary** design system, featuring multi-role portals for tenants, property owners, and platform administrators.

---

## 📋 Table of Contents
1. [Tech Stack & Architecture](#1-tech-stack--architecture)
2. [Directory Structure](#2-directory-structure)
3. [Portals & Page Routing](#3-portals--page-routing)
4. [Design System & Styling](#4-design-system--styling)
5. [State Management & Contexts](#5-state-management--contexts)
6. [Services & Data Layer](#6-services--data-layer)
7. [Interactive Maps & Geolocation](#7-interactive-maps--geolocation)
8. [Quick Start & Scripts](#8-quick-start--scripts)
9. [Demo Accounts & Testing](#9-demo-accounts--testing)

---

## 1. Tech Stack & Architecture

- **Framework:** [React 18.3](https://react.dev/)
- **Build Tool:** [Vite 5](https://vitejs.dev/) with Fast Refresh
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) with the `@tailwindcss/vite` plugin
- **Routing:** [React Router v6](https://reactrouter.com/) (declarative nested layouts with role-based auth guards)
- **Icons:** [Lucide React](https://lucide.dev/) (modern, clean SVG icons)
- **Motion & Transitions:** [Framer Motion](https://www.framer.com/motion/) (smooth micro-interactions, modals, accordions)
- **Maps & Geolocation:** [Leaflet](https://leafletjs.com/) with OpenStreetMap tiles and reverse-geocoding

---

## 2. Directory Structure

```
frontend-3/
├── index.html                  # HTML entry point loading Google Fonts (Newsreader, Plus Jakarta Sans)
├── package.json                # Dependencies, scripts, and workspace metadata
├── vite.config.js              # Vite server configuration (port 5175, Tailwind v4 integration)
└── src/
    ├── main.jsx                # DOM root mount & Router provider
    ├── App.jsx                 # Global context provider tree (Auth, Toast, Modal)
    ├── index.css               # Design tokens, color system, and keyframe animations
    ├── context/                # Global React Contexts
    │   ├── AuthContext.jsx     # Current authenticated user, session state, login/logout
    │   ├── ModalContext.jsx    # Centralized modal dialog controller
    │   └── ToastContext.jsx    # Real-time alert notifications system
    ├── layouts/                # Structural layout wrappers
    │   ├── PublicLayout.jsx    # Public navigation dock, banner ads, and footer
    │   ├── TenantLayout.jsx    # Tenant dashboard shell, navigation rail, and user menu
    │   ├── OwnerLayout.jsx     # Landlord property management shell and stats header
    │   └── AdminLayout.jsx     # Platform moderation panel and administrative controls
    ├── routes/                 # Routing configuration
    │   ├── AppRoutes.jsx       # Route tree mapping URLs to pages and layouts
    │   └── RequireAuth.jsx     # Role-based route protection guard
    ├── pages/                  # Page views grouped by portal
    │   ├── public/             # Home, Browse, PropertyDetails, About, Story, Team, Ads
    │   ├── tenant/             # Dashboard, Saved, Visits, Messages, Notifications, Profile
    │   ├── owner/              # Dashboard, Properties, AddProperty, EditProperty, Visits, Earnings
    │   └── admin/              # Overview, Listings, Users, Visits, Moderation, Financials, Settings
    ├── components/             # Reusable UI component library
    │   ├── common/             # Button, Badge, Input, Modal, AuthModal, Toast, Dropdown
    │   ├── layout/             # Header (frosted glass dock), Footer (architectural slate)
    │   ├── property/           # PropertyCard, PropertyFilters, PropertyMap, LocationPicker, Gallery
    │   ├── messaging/          # ConversationList, ChatWindow, MessageBubble
    │   └── dashboard/          # DashboardShell, StatCard, ChartCard, DataTable
    ├── services/               # API & client service layer
    │   ├── authService.js      # Authentication, registration, password management
    │   ├── propertyService.js  # Listing discovery, filters, search, and CRUD operations
    │   ├── visitService.js     # Visit requests scheduling, status updates, cancellations
    │   ├── messageService.js   # Conversation threads and direct messaging
    │   ├── transactionService.js # Rent payments, owner earnings, platform revenue
    │   ├── userService.js      # User management, verification updates, profile editing
    │   ├── adminService.js     # Platform analytics, settings, audit logging
    │   └── advertisementService.js # Sponsored ad banners and impression tracking
    ├── hooks/                  # Custom React hooks (useAsync, useDebounce, useStoreVersion)
    ├── utils/                  # Constants (districts, property types), formatters, validators
    └── data/                   # Seed data and reactive local store
```

---

## 3. Portals & Page Routing

The application provides **4 distinct user experiences**:

### 1. 🏔️ Public Portal (`/`)
Accessible to all visitors without authentication:
- `/` — **Homepage:** Hero showcase, 3D animated cards, category ribbon, featured listings, testimonials.
- `/browse` — **Search & Filter:** Advanced faceted filtering by district (Gilgit, Hunza, Skardu, etc.), property type, furnishing, budget range, and interactive Leaflet map view.
- `/property/:id` — **Property Detail:** Photo gallery lightbox, host verification badge, amenities breakdown, Google Maps coordinates, tenant reviews, and visit request trigger.
- `/about`, `/story`, `/team`, `/advertisements` — Institutional, cultural context, and partner advertising.

### 2. 🔑 Tenant Portal (`/tenant/*`)
Protected for authenticated tenants (`role: 'tenant'`):
- `/tenant/dashboard` — Overview of scheduled tours, saved listings, and recent activity.
- `/tenant/saved` — Wishlist of bookmarked properties with quick scheduling.
- `/tenant/visits` — 5-step visit scheduling wizard and live status tracker (Pending, Approved, Completed).
- `/tenant/messages` — Real-time direct chat with property landlords.
- `/tenant/notifications` — Notification feed for visit confirmations and inquiries.
- `/tenant/profile` — Personal profile and verification status.

### 3. 🏡 Owner / Landlord Portal (`/owner/*`)
Protected for authenticated property owners and agents (`role: 'owner'`):
- `/owner/dashboard` — Performance metrics (active listings, inquiries, views, monthly revenue).
- `/owner/properties` — Listings manager with status badges (Approved, Pending Review, Suspended).
- `/owner/add-property` — Multi-step listing creator with interactive Leaflet map pin dropper, photo upload, and district reverse-geocoding.
- `/owner/edit-property/:id` — Edit pricing, availability, and description.
- `/owner/visits` — Approve, decline, or reschedule tenant visit appointments with owner notes.
- `/owner/earnings` — Monthly gross rent, 5% platform commission deduction, and net owner payout schedule.
- `/owner/messages` — Direct chat channel with prospective tenants.

### 4. 🛡️ Platform Admin Portal (`/admin/*`)
Protected for platform administrators (`role: 'admin'`):
- `/admin/dashboard` — System KPIs (total users, active listings, gross platform volume, commission).
- `/admin/listings` — Moderation queue to inspect property deeds, approve, or flag listings.
- `/admin/users` — Search, filter, inspect, and toggle active/suspended statuses across all accounts.
- `/admin/visits` — Platform-wide inspection tour logs.
- `/admin/financials` — Transaction ledger, 5% platform fee revenue, and payout holds.
- `/admin/settings` — Configure platform fee percentage, auto-approval toggles, and support email.

---

## 4. Design System & Styling

The frontend is styled with **Tailwind CSS v4** following the bespoke **Alpine Sanctuary** design tokens:

### Color Palette
| Token | Hex Code | Purpose |
| :--- | :--- | :--- |
| **Alpine Slate** | `#0B1320` | Primary brand tone, dark surfaces, navigation bar, hero backdrops |
| **Karakoram Amber** | `#D97706` / `#FE932C` | Warm gold action highlights, call-to-actions, featured badges |
| **Glacial Mist** | `#F8FAFC` | Main canvas surface background |
| **Emerald Verification**| `#059669` | Trust & safety verified badges, approved states |
| **Slate Border** | `rgba(255,255,255,0.1)` | Crisp frosted glass dividers and glassmorphic card borders |

### Typography
- **Headings & Titles:** `Newsreader` — Transitional editorial serif with elegant italic variants for mountain aesthetics.
- **UI & Data Displays:** `Plus Jakarta Sans` — Modern geometric sans-serif for high readability on cards, tables, and buttons.

---

## 5. State Management & Contexts

- **`AuthContext`:**
  - Persists the logged-in user in `localStorage` and memory.
  - Exposes `user`, `login(email, password)`, `signup(formData)`, and `logout()`.
  - Integrates seamlessly with the backend REST API (`/api/auth/*`).
- **`ModalContext`:**
  - Coordinates global dialogs, including the multi-role Sign In modal and visit booking confirmation.
- **`ToastContext`:**
  - Lightweight, non-blocking notification alerts with automatic auto-dismiss.

---

## 6. Services & Data Layer

The frontend service layer in [`src/services/`](file:///c:/Users/uddin/Downloads/sq/frontend-3/src/services/) cleanly isolates data operations from React components.

- **Dual-Mode Capability:**
  1. **REST API Mode:** Calls the Express + MongoDB backend on `http://localhost:5000/api` using standard JSON endpoints.
  2. **Reactive Local Store Mode:** Includes an in-memory client store with simulated latency (`300ms`) and event subscriptions, ensuring zero-configuration fallback if the backend is being restarted.

---

## 7. Interactive Maps & Geolocation

Located in [`src/components/property/PropertyMap.jsx`](file:///c:/Users/uddin/Downloads/sq/frontend-3/src/components/property/PropertyMap.jsx) and `LocationPicker.jsx`:
- Built on top of **Leaflet** with standard OpenStreetMap tiles.
- Pre-configured coordinates for all 10 Gilgit-Baltistan districts:
  - Gilgit (`35.9208, 74.3089`)
  - Hunza (`36.3167, 74.6500`)
  - Skardu (`35.2971, 75.6333`)
  - Ghizer, Nagar, Diamer, Astore, Shigar, Kharmang, Ghangche.
- Landlords can drop a pin anywhere in the region, and reverse-geocoding automatically resolves the district and city.

---

## 8. Quick Start & Scripts

### 1. Install Dependencies
```bash
# Inside frontend-3/
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```
The application will launch at **http://localhost:5175/** with hot module replacement (HMR).

### 3. Production Build & Preview
```bash
# Compile optimized bundle into dist/
npm run build

# Preview production build locally
npm run preview
```

---

## 9. Demo Accounts & Testing

The **Sign In** modal features **1-click instant login buttons** for every role:

| Role | Email | Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Tenant** | `tenant@rentlink.pk` | `Password123!` | Search, favorite listings, schedule visits, message landlords |
| **Owner** | `owner@rentlink.pk` | `Password123!` | Post listings, set Leaflet GPS coordinates, approve visits, view earnings |
| **Admin** | `admin@rentlink.pk` | `Admin123!` | Verify landlords, approve/reject listings, manage users, platform settings |
