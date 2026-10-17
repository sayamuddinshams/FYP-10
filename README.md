# RentLink · Rental Housing Platform

RentLink is a modern, full-featured rental housing marketplace designed for tenants, property owners, and platform administrators.

---

## Quick Start (How to Run)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 2. Installation
From the project root:
```bash
# Install frontend dependencies
npm --prefix frontend install
```

### 3. Start Development Server
From the project root:
```bash
npm run dev
```
> The local development server will start at **http://localhost:5174/**

### 4. Build for Production
```bash
npm run build
```

---

## Project Structure

```
sq/
├── package.json              # Root package config enabling workspace scripts
├── README.md                 # Project documentation & run guide
├── backend/                  # Backend directory (prepared for REST/GraphQL API)
│   └── README.md
└── frontend/                 # React + Vite application
    ├── index.html            # HTML entry template
    ├── vite.config.js        # Vite configuration (port 5174, base path)
    ├── package.json          # Frontend dependencies & scripts
    └── src/
        ├── App.jsx           # Root provider wrapper (Auth, Toast, Modal)
        ├── main.jsx          # React DOM mount point & router setup
        ├── components/       # Reusable UI & domain components
        │   ├── common/       # Button, Modal, Dropdown, Input, Toast, etc.
        │   ├── dashboard/    # Shell, StatCard, ChartCard, DataTable
        │   ├── layout/       # Header, Footer
        │   ├── messaging/    # ChatWindow, ConversationList
        │   └── property/     # PropertyCard, Filters, Gallery, Modals
        ├── context/          # React Context (Auth, Modals, Toast)
        ├── data/             # Mock database store (users, properties, visits)
        ├── hooks/            # Custom React hooks (useAsync, useAuth, etc.)
        ├── layouts/          # Layout shells (Public, Tenant, Owner, Admin)
        ├── pages/            # Page views
        │   ├── admin/        # Admin dashboard, users, moderation, analytics
        │   ├── owner/        # Owner dashboard, listings CRUD, visits, earnings
        │   ├── public/       # Home, Browse, Details, About, Story, Team
        │   └── tenant/       # Tenant dashboard, saved listings, visits, chat
        ├── routes/           # Route definitions & authentication guards
        ├── services/         # API & business logic layer
        └── utils/            # Helper utilities, formatting & validation
```

---

## Demo Accounts

You can test any role directly via the **Sign In** modal on the top navigation bar:
- **Tenant**: Pre-configured renter account with saved properties and visit requests
- **Owner / Landlord**: Property owner account with listings, visit requests, and earnings stats
- **Admin**: Platform administrator with moderation tools, analytics, and transaction logs
