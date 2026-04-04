# CivicFix Backend

Node.js + Express + PostgreSQL backend for the existing CivicFix frontend.

## What this backend covers

- User registration and login with JWT
- User profile and preferences
- Civic issue reporting
- Issue feed with search, filters, sorting, and nearby lookup
- Issue details with admin updates, reviews, and vote tallies
- Upvotes
- Admin progress updates and escalation
- Resolution proof upload workflow
- Community satisfaction voting
- Notifications
- Admin analytics

## Setup

1. Create a PostgreSQL database named `civicfix`.
2. Copy `.env.example` to `.env`.
3. Update `DATABASE_URL`, `JWT_SECRET`, and `CORS_ORIGIN`.
4. Install packages:

```bash
npm install
```

5. Apply schema:

```bash
npm run db:schema
```

6. Seed demo data:

```bash
npm run db:seed
```

7. Start the API:

```bash
npm run dev
```

## Demo users

- Admin: `admin@civicfix.com` / `admin123`
- Citizen: `user@civicfix.com` / `pass12345`

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/meta/categories`
- `GET /api/meta/statuses`
- `GET /api/issues`
- `GET /api/issues/:id`
- `POST /api/issues`
- `POST /api/issues/:id/upvote`
- `DELETE /api/issues/:id/upvote`
- `POST /api/issues/:id/reviews`
- `POST /api/issues/:id/votes`
- `POST /api/issues/:id/not-fixed`
- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `POST /api/notifications/read-all`
- `GET /api/profile/me/summary`
- `GET /api/profile/me/issues?type=reported|upvoted|resolved`
- `PUT /api/profile/me`
- `GET /api/admin/analytics`
- `GET /api/admin/issues`
- `POST /api/admin/issues/:id/updates`
- `POST /api/admin/issues/:id/resolve-request`

## Frontend integration notes

Your current frontend is still static and reads from hardcoded arrays in `js/data.js`. To move fully onto this backend, replace those local mutations with API calls:

- `auth.html`: use `/api/auth/register` and `/api/auth/login`
- `index.html`: use `/api/issues` and `/api/meta/categories`
- `issue.html`: use `/api/issues/:id`, `/upvote`, `/reviews`, `/votes`
- `report.html`: use `/api/issues`
- `notifications.html`: use `/api/notifications`
- `profile.html`: use `/api/profile/me/summary` and `/api/profile/me/issues`
- `admin.html`: use `/api/admin/analytics`, `/api/admin/issues`, `/updates`, `/resolve-request`
- `map.html`: use `/api/issues?lat=...&lng=...&radiusKm=...`

## Recommended next step

I have not yet rewired the frontend pages to consume this API. If you want, the next pass should add a shared `api.js` layer and replace the `localStorage` demo state in the HTML pages with real backend calls.
