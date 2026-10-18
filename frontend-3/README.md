# RentLink (Alpine Sanctuary Edition) — `frontend-3`

A modern, editorial real estate & hospitality platform for Gilgit-Baltistan, designed around the **Alpine Sanctuary** design system.

---

## 🏔️ Highlights & Features

- **Alpine Sanctuary Design System:** Deep Alpine slate foundations (`#0B1320`), Karakoram amber gold accents (`#D97706` / `#FE932C`), emerald verification stamps (`#059669`), and glacial mist surfaces (`#F8FAFC`).
- **Editorial Typography:** Expressive `Newsreader` transitional serif headers with italic styling paired with geometric `Plus Jakarta Sans` for UI, data tables, and metrics.
- **3D Curved Bow Marquee:** Continuous property category ribbon with interactive 3D perspective transforms.
- **Segmented Search Hub:** Integrated district, property type, and budget pickers with quick district pills.
- **Multi-Role Portals:** Unified dashboards and layouts for:
  - **Tenants:** Saved wishlist, scheduled visits, in-app messaging, notifications.
  - **Property Owners:** Property listings manager, visit requests approval, earnings, direct chat.
  - **Platform Administrators:** Verification moderation (deed review & verification badge), user management, analytics, platform transactions.
- **Calibrated Density & Scaling:** Proportioned typography, compact headers (56px), and responsive padding across desktop, tablet, and mobile viewports.
- **Zero Legacy Interference:** Self-contained in `frontend-3/`, allowing side-by-side comparison with the legacy `frontend/`.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd frontend-3
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
By default, the Vite dev server starts on **http://localhost:5175**.

### 3. Production Build & Preview
```bash
# Build production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## 👥 Demo User Accounts (One-Click Role Switching)

The application includes instant demo account switchers available directly in the Auth Modal:

| Role | Demo Identity | Focus / Access |
| :--- | :--- | :--- |
| **Tenant** | Karim Ali (`tenant@rentlink.pk`) | Browse listings, schedule property visits, message owners, save wishlist |
| **Owner** | Hunza Heritage Homes (`owner@rentlink.pk`) | List properties, approve/decline visits, chat with tenants, review earnings |
| **Admin** | RentLink Moderation (`admin@rentlink.pk`) | Verify properties, inspect ownership deeds, moderate users & listings |

---

## 📁 Directory Structure

```
frontend-3/
├── index.html                  # HTML entry point with Newsreader & Plus Jakarta Sans Google Fonts
├── package.json                # Dependencies: React 18, React Router v6, Tailwind CSS v4, Vite
├── vite.config.js              # Vite configuration (port 5175, @tailwindcss/vite plugin)
└── src/
    ├── main.jsx                # Application root entry
    ├── App.jsx                 # Global providers (Auth, Modals, Toasts)
    ├── index.css               # Tailwind v4 theme tokens, frosted glass, keyframe animations
    ├── context/                # AuthContext, ModalContext, ToastContext
    ├── hooks/                  # useAsync, useFavorite, useReducedMotion
    ├── utils/                  # constants, formatting helpers, form validators
    ├── data/                   # Mock GB listings, regional districts, users, visits, messages
    ├── services/               # Modular service layer for properties, visits, chat, admin
    ├── components/
    │   ├── common/             # Button, Badge, Input, Modal, AuthModal, Toast, Skeleton
    │   ├── layout/             # Header (frosted glass dock), Footer (architectural slate)
    │   ├── property/           # PropertyCard, PropertyFilters, FilterDrawer, Lightbox Gallery
    │   └── dashboard/          # DashboardShell, StatCard, DataTable, ChartCard
    ├── layouts/                # PublicLayout, TenantLayout, OwnerLayout, AdminLayout
    ├── routes/                 # AppRoutes, RequireAuth
    └── pages/
        ├── public/             # Home, Browse, Details, About, Story, Team, Collaborations, Ads
        ├── tenant/             # Dashboard, Saved, Visits, Messages, Notifications, Settings
        ├── owner/              # Dashboard, Properties, Add/Edit Listing, Visits, Earnings
        └── admin/              # Dashboard, Moderation, Users, Owners, Visits, Analytics
```

---

## 🎨 Color Tokens Reference

| Token | Hex Code | Visual Application |
| :--- | :--- | :--- |
| **Primary** | `#0B1320` | Alpine deep slate, hero backdrops, primary buttons, navigation rail |
| **Secondary Accent** | `#D97706` / `#FE932C` | Warm Karakoram amber, prestige badges, action highlights |
| **Tertiary Sage** | `#059669` | Emerald verification badges, active status, success states |
| **Canvas** | `#F8FAFC` | Glacial mist surface background |
| **Card Fill** | `#FFFFFF` | Crisp snow card containers with subtle ambient elevation |
