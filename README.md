# Pesenin! WMS (MVP)

Minimalist mobile-first SPA built with Vite + React + TypeScript + TailwindCSS, styled with shadcn-like components.

## Scripts

- dev: `npm run dev`
- build: `npm run build`
- preview: `npm run preview`

## Setup

1. Install deps: `npm install`
2. Create an env file `.env` (or `.env.local`) at the project root:

   ```bash
   VITE_API_BASE_URL=http://localhost:3000
   ```

   - The app uses a JWT bearer token returned by the API (`/api/v1/auth/login`).
   - All requests are sent to `${VITE_API_BASE_URL}`.
3. Start the dev server: `npm run dev`

## Features (MVP)

- Inventory
  - Materials: CRUD with unit, quantity, low‑stock threshold, expiry date
  - Products: CRUD with BOM (per‑portion recipe); show material units; inline BOM qty editing
- Orders
  - Multi‑item order creation (add multiple products before placing)
  - Edit an order item quantity within 5 minutes
  - Cancel an order (restores materials)
  - Complete an order
- Dashboard
  - 14‑day orders bar chart (excludes cancelled orders)
  - Low‑stock and expiring‑soon material lists
- UX
  - Toast notifications (top‑right, below navbar) for success/errors (incl. validation details)
  - Mobile‑first layout with bottom nav on small screens

## API

- Developers can obtain the API contract from the `pesenin-web-api` apps.
- Auth: JWT via `Authorization: Bearer <token>`.
- Key endpoints used:
  - Auth: `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/profile`
  - Materials: `/api/v1/materials` CRUD
  - Products: `/api/v1/products`, `/api/v1/products/:id/bom`
  - Orders:
    - List/Create: `/api/v1/orders` (POST accepts `{ orderDate, items: [{ productId, quantity }] }`)
    - Item qty: `PUT /api/v1/orders/:orderId/items/:itemId/quantity`
    - Cancel: `POST /api/v1/orders/:id/cancel`
    - Complete: `POST /api/v1/orders/:id/complete`

## Notes

- Designed for 375px up to 768px viewports.
- Ensure CORS is enabled on the API for the dev origin (e.g., `http://localhost:5173`).
