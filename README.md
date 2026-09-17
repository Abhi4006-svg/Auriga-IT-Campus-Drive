# BeanLedger

> **Café Rewards Management System**  
> *"Build the counter something so every member's points balance is always exactly right."*

---

## Overview

BeanLedger is a full-stack Café Rewards Management System designed specifically for café counter staff. It solves the core problem of points discrepancies, unearned redemptions, and manual math errors by enforcing **authoritative server-side points calculation**, dynamic membership tier progression, and atomic points redemption logging.

---

## Problem Statement

Cafés running loyalty programs often suffer from:
1. **Frontend point desynchronization**: Calculating points on the browser allows tampering or rounding errors.
2. **Revenue leakage**: Members redeeming free coffees when they don't have enough points.
3. **Counter friction**: Slow search lookups when cashiers try to find a member by phone number during rush hours.

BeanLedger solves these issues by shifting all accounting logic to a centralized Node.js/Express backend backed by MongoDB, giving cashiers sub-second lookups and zero-math point issuing.

---

## Key Features

- **Strict Server-Side Points Accounting**: Points and balances are computed exclusively on the backend (`pointsService.js`).
- **Dynamic Membership Tiers**:
  - **Regular Tier**: Lifetime spend < $100 (1.0x points multiplier)
  - **Silver Tier**: Lifetime spend $100 – $499.99 (1.5x points multiplier)
  - **Gold Tier**: Lifetime spend $500 – $4,999.99 (2.0x points multiplier)
  - **Platinum Tier (Level 1 Twist)**: Lifetime spend ≥ $5,000 (**3.0x multiplier / 0.3 points per unit**). Backward-compatible: existing members remain unchanged unless qualifying.
- **90-Day Points Expiration (Level 2 Twist)**: Unused points >90 days old expire automatically. Evaluated & graded via `POST /clock` and `POST /api/clock` time simulation endpoint.
- **Tier Upgrade Notification Outbox (Level 3 Twist)**: Crossing into a new tier automatically generates a `TIER_UPGRADE` notification event exposed via `GET /outbox` and `GET /api/outbox`.
- **Sub-Second Phone & Name Search**: Instant regex search over indexed phone numbers and names.
- **Server-Side Pagination & Sorting**: Clean API filtering over large customer lists.
- **Atomic Reward Redemption**: Validates point balance before deducting points and creating a transaction audit log.
- **Counter Dashboard**: Summary stats (Total Members, Today's Purchases, Points Issued, Redemptions) + Quick Search.
- **Transaction Audit History**: Complete audit trail of every purchase and redemption.

---

## Tech Stack

- **Frontend**: React (Vite), React Router DOM v7, Tailwind CSS v4, Lucide React icons, Axios.
- **Backend**: Node.js, Express.js, MongoDB, Mongoose ORM, JWT Authentication, bcryptjs password hashing.
- **Database Resilience**: Auto-connects to local MongoDB (`mongodb://127.0.0.1:27017/beanledger`) with an automatic fallback to `mongodb-memory-server` if local MongoDB is unreachable.

---

## Prerequisites

- **Node.js**: v18.0.0 or higher (v22 tested)
- **npm**: v9.0.0 or higher

---

## Environment Variables

### Server (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/beanledger
JWT_SECRET=supersecret_beanledger_jwt_key_2026
NODE_ENV=development
```

---

## Installation & Running Locally

### 1. Install Dependencies

Run from project root:
```bash
# Install dependencies for both server and client
npm run install:all
```

Or install individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Seed Database

Populate demo staff account, 18 demo members across Regular/Silver/Gold tiers, rewards catalog, and transaction history:
```bash
npm run seed
```

### 3. Start Backend & Frontend

#### Start Backend Server:
```bash
npm run server
# Running on http://localhost:5000
```

#### Start Frontend Client:
```bash
npm run client
# Running on http://localhost:3000
```

---

## Demo Credentials

Use these credentials to log in as café counter staff:

- **Role**: Counter Barista Lead
- **Email**: `staff@beanledger.com`
- **Password**: `password123`

*(Alternatively, register a new staff account on `/register`).*

---

## Complete REST API Specification

### Authentication

| Method | Endpoint | Auth | Purpose | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new staff user | `{ name, email, password, role }` |
| `POST` | `/api/auth/login` | Public | Staff login & JWT generation | `{ email, password }` |
| `POST` | `/api/auth/logout` | Public | Invalidate staff session | None |
| `GET` | `/api/auth/me` | Bearer | Get current staff user profile | None |

### Members

| Method | Endpoint | Auth | Purpose | Query Parameters / Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/members` | Bearer | Create a new member | Body: `{ name, phone, email }` |
| `GET` | `/api/members` | Bearer | Search/Paginate/Sort members | `?search=987&page=1&limit=10&sortBy=name&order=asc` |
| `GET` | `/api/members/:id` | Bearer | Get member profile details | None |
| `GET` | `/api/members/:id/transactions` | Bearer | Get member transaction log | `?page=1&limit=20` |

### Purchases & Points

| Method | Endpoint | Auth | Purpose | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/members/:id/purchases` | Bearer | Record purchase & calculate points | `{ amount: 25.50, description: "2 Lattes" }` |

**Example Response (`POST /api/members/:id/purchases`):**
```json
{
  "success": true,
  "message": "Purchase recorded successfully",
  "data": {
    "member": {
      "_id": "675aca8e...",
      "name": "Sarah Jenkins",
      "phone": "9876543210",
      "pointsBalance": 180,
      "tier": "Silver",
      "lifetimeSpend": 120.00
    },
    "purchaseSummary": {
      "amount": 120.00,
      "tierUsed": "Regular",
      "earningMultiplier": 1.5,
      "pointsEarned": 180,
      "newBalance": 180,
      "promotedTier": "Silver"
    }
  }
}
```

### Rewards & Redemptions

| Method | Endpoint | Auth | Purpose | Request Body |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/rewards` | Public | Get active rewards catalog | None |
| `POST` | `/api/rewards` | Bearer | Create a new reward item | `{ name, description, pointsCost }` |
| `POST` | `/api/members/:id/redeem` | Bearer | Redeem reward points | `{ rewardId: "675aca8e..." }` |

### Assessment Twists & Grading Endpoints

| Method | Endpoint | Auth | Purpose | Request Body / Query |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/clock` / `/api/clock` | Public | Simulate time travel & expire 90-day stale points | `{ currentDate: "2026-12-17T00:00:00.000Z" }` |
| `GET` | `/outbox` / `/api/outbox` | Public | Retrieve tier upgrade notification outbox events | `?status=PENDING` |

**Example Response (`POST /api/members/:id/redeem`):**
```json
{
  "success": true,
  "message": "Successfully redeemed 'Free Regular Coffee / Espresso'",
  "data": {
    "member": {
      "_id": "675aca8e...",
      "pointsBalance": 80,
      "tier": "Silver"
    },
    "reward": {
      "name": "Free Regular Coffee / Espresso",
      "pointsCost": 100
    }
  }
}
```

---

## Points & Tier Business Rules

1. **Member Tier Rules**:
   - `Regular`: Lifetime Spend < $100 -> Earning Multiplier = **1.0x** ($1 = 1 point)
   - `Silver`: Lifetime Spend $100 – $499.99 -> Earning Multiplier = **1.5x** ($1 = 1.5 points)
   - `Gold`: Lifetime Spend ≥ $500 -> Earning Multiplier = **2.0x** ($1 = 2.0 points)
2. **Points Calculation**:
   - `Points Earned = Math.floor(Purchase Amount * Multiplier)`
   - Floating point precision is rounded down cleanly to prevent non-integer point totals.
3. **Redemption Rules**:
   - A redemption request is rejected with `400 Bad Request` if `member.pointsBalance < reward.pointsCost`.

---

## Search, Pagination, and Sorting

- **Search**: `GET /api/members?search=987` matches both phone numbers and member names using case-insensitive regular expressions.
- **Pagination**: `GET /api/members?page=1&limit=10` returns total member count, total pages, current page, and slice of members.
- **Sorting**: Whitelisted sort fields (`name`, `pointsBalance`, `tier`, `lifetimeSpend`, `createdAt`) with order `asc` or `desc`.

---

## Testing

Run automated API integration tests verifying all 9 core flows:
```bash
cd server && node src/test_api.js
```

---

## Common Debugging Issues & Fixes

1. **MongoDB Connection Warning**:
   - *Issue*: Local MongoDB daemon is not running on `localhost:27017`.
   - *Fix*: The app automatically starts `mongodb-memory-server` in the background. No manual DB setup required!
2. **CORS Errors**:
   - *Fix*: Express server has `cors()` enabled and Vite proxies `/api` requests to `http://localhost:5000`.
3. **Invalid Token Error (401)**:
   - *Fix*: Log out and re-login using demo staff credentials (`staff@beanledger.com` / `password123`).

---

## Three Future Features

1. **Automated SMS & Email Tier Alerts**: Trigger Twilio/SendGrid notifications when a member reaches Silver/Gold status.
2. **Configurable Double-Points Days**: Promotional rules engine (e.g. "Double Points Tuesdays").
3. **Multi-Store Franchise POS API**: POS register integrations (Square, Toast, Clover).
