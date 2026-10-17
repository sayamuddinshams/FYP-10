# RentLink Backend

## Architecture Overview

Currently, the RentLink application operates with a fully interactive client-side mock database located at:
`frontend/src/data/store.js`

This mock store implements:
- User authentication & role management (`tenant`, `owner`, `admin`)
- Property listings, search, filtering, and CRUD operations
- Visit scheduling and status workflows
- Direct messaging and conversation threads
- Notifications, financial transactions, and platform analytics

## Future Backend Integration

This `backend/` directory is prepared for the upcoming server-side implementation:
1. **API Server:** Node.js (Express/Fastify) or Python (FastAPI)
2. **Database:** PostgreSQL or SQLite with schema migrations
3. **Authentication:** JWT tokens / HTTP-only session cookies
4. **Media Storage:** Cloud Object Storage (e.g., S3, Google Cloud Storage) for listing photos
