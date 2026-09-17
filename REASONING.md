# REASONING.md — Engineering Decision Document

**Product Name**: BeanLedger  
**Subtitle**: Café Rewards Management System  
**System Goal**: "Build the counter something so every member's points balance is always exactly right."

---

## 1. Problem Understanding

Café loyalty programmes suffer from point balance desynchronization, unearned reward redemptions, and front-counter delay. When point calculations or tier multipliers are left to client-side logic or manual staff math, errors inevitably creep in. 

BeanLedger eliminates these issues by implementing an **authoritative backend ledger model**. The client UI never submits or manipulates a member's points balance directly; all calculations, tier promotions, and redemption deductions are executed atomically on the server and logged in a transaction audit trail.

---

## 2. Functional Requirements

- **Staff Authentication**: Secure login/registration for café staff with JWT session management.
- **Member Management**: Create, search (phone & name), list (paginated & sorted), and view member profiles.
- **Server-Side Points Accounting**: Record purchases, compute tier-based earning multipliers, and issue integer points.
- **Dynamic Tier Calculation**: Automatically calculate tier (Regular, Silver, Gold) based on lifetime spend.
- **Reward Redemption**: Validate member balance before deducting reward cost and logging a REDEMPTION transaction.
- **Audit History**: Log every points delta with balance after transaction and staff creator reference.
- **Counter Dashboard**: Display live summary metrics (Total Members, Today's Purchases, Points Issued, Redemptions).

---

## 3. Non-Functional Requirements

- **Data Consistency**: Atomic updates to member balances and transaction logs.
- **Low Latency Lookups**: Indexed MongoDB phone number search for sub-second counter responses.
- **Scalability**: Server-side pagination and whitelisted sorting to handle thousands of members smoothly.
- **Zero-Friction Deployment**: Automatic fallback to `mongodb-memory-server` if local MongoDB daemon is unreachable.

---

## 4. Important Assumptions

1. **Tier Rules Thresholds**:
   - **Regular Tier**: Lifetime Spend < $100 -> Earning Multiplier = **1.0x** ($1 = 1 point)
   - **Silver Tier**: Lifetime Spend $100 – $499.99 -> Earning Multiplier = **1.5x** ($1 = 1.5 points)
   - **Gold Tier**: Lifetime Spend $500 – $4,999.99 -> Earning Multiplier = **2.0x** ($1 = 2 points)
   - **Platinum Tier (Level 1 Twist)**: Lifetime Spend ≥ $5,000 -> Earning Multiplier = **3.0x** (0.3 points per unit). Backward-compatible design ensures existing members' tiers and balances are untouched unless qualifying.
2. **90-Day Points Expiration (Level 2 Twist)**:
   - Unredeemed purchase points older than 90 days automatically expire. Evaluated via `POST /clock` and `POST /api/clock`.
3. **Outbox Notification System (Level 3 Twist)**:
   - Tier promotions generate outbox events exposed via `GET /outbox` and `GET /api/outbox`.
2. **Rounding Rule**:
   - Points earned = `Math.floor(amount * multiplier)`. Clean integer points avoid fractional point ambiguities.
3. **Phone Number Uniqueness**:
   - Primary lookup key is phone number. Duplicate phone numbers are rejected at database schema level.

---

## 5. Architecture Decisions

- **MERN Monorepo Structure**:
  - `server/`: Node.js + Express REST API with Mongoose ORM.
  - `client/`: React + Vite single page app with Tailwind CSS styling.
- **Decoupled Business Logic**:
  - Business rules isolated in `server/src/services/pointsService.js` to ensure deterministic calculations across all API controllers.
- **Stateless Authentication**:
  - JWT Tokens passed in `Authorization: Bearer <token>` header, allowing horizontal API scaling.

---

## 6. Database Design Decisions

Design includes 4 indexed collections in MongoDB:

1. **`User` Collection**:
   - `name`, `email` (unique, lowercase), `passwordHash`, `role` ('staff'|'admin').
2. **`Member` Collection**:
   - `name`, `phone` (unique indexed), `email`, `pointsBalance` (min 0), `tier` ('Regular'|'Silver'|'Gold'), `lifetimeSpend`, `lifetimePoints`.
3. **`Transaction` Collection**:
   - `memberId` (ref Member, indexed), `type` ('PURCHASE'|'REDEMPTION'), `amount`, `points` (positive for purchase, negative for redemption), `description`, `balanceAfter`, `createdBy` (ref User).
4. **`Reward` Collection**:
   - `name`, `description`, `pointsCost` (min 1), `active` (boolean).

---

## 7. Points Calculation Design

All purchase points are calculated via `calculatePurchasePoints(amount, tier)` in `pointsService.js`.
```js
const calculatePurchasePoints = (purchaseAmount, currentTier) => {
  const amount = Number(purchaseAmount) || 0;
  if (amount <= 0) return 0;
  const multiplier = getEarningMultiplier(currentTier);
  return Math.floor(amount * multiplier);
};
```
This ensures zero reliance on frontend calculations.

---

## 8. Tier Design

Tier calculation is deterministic based on total `lifetimeSpend`:
```js
const calculateTier = (lifetimeSpend) => {
  const spend = Number(lifetimeSpend) || 0;
  if (spend >= 500) return 'Gold';
  if (spend >= 100) return 'Silver';
  return 'Regular';
};
```
When a purchase is recorded, `lifetimeSpend` is incremented, and `calculateTier(member.lifetimeSpend)` is executed to check if the member qualifies for a tier promotion.

---

## 9. Redemption Design

Redemption follows a strict 8-step safety pattern:
1. Fetch member by ID.
2. Fetch reward by ID.
3. Check `reward.active === true`.
4. Validate `member.pointsBalance >= reward.pointsCost`.
5. If balance is insufficient, return `400 Bad Request` with message: *"Insufficient points for this reward..."*
6. Deduct exact points cost: `member.pointsBalance -= reward.pointsCost`.
7. Create `Transaction` record with `type: 'REDEMPTION'`, `points: -reward.pointsCost`, and `balanceAfter`.
8. Return updated member profile to frontend.

---

## 10. API Design

RESTful JSON convention with standard status codes:
- `200 OK` / `201 Created` with `{ success: true, message, data }`
- `400 Bad Request` / `401 Unauthorized` / `404 Not Found` with `{ success: false, message }`

---

## 11. Frontend Design

- Warm, modern café aesthetic (stone dark mode with amber/gold accents).
- Single Page Navigation with React Router v7.
- Modals for **Record Purchase** (with live earning preview) and **Redeem Reward** (with points verification badge).
- Responsive mobile & desktop support.

---

## 12. Search, Pagination, and Sorting Approach

- **Search**: Case-insensitive regular expression over `phone` and `name` fields.
- **Pagination**: Server-side `.skip((page-1)*limit).limit(limit)` with `total` and `totalPages` calculation.
- **Sorting**: Whitelisted sort parameter validation (`['name', 'phone', 'pointsBalance', 'tier', 'lifetimeSpend', 'createdAt']`) to prevent MongoDB query injection.

---

## 13. Security Decisions

- Password hashing using `bcryptjs` with salt factor 10.
- JWT verification middleware (`protect`) on all counter endpoints.
- Password hashes excluded from API queries (`.select('-passwordHash')`).
- Whitelisted query parameters to prevent query parameter pollution.

---

## 14. Edge Cases Considered

- **Duplicate Phone Number**: Returns clear 400 error message.
- **Zero or Negative Purchase Amount**: Rejected before DB save.
- **Insufficient Points Redemption**: Server validation rejects request.
- **Inactive Reward Redemption**: Rejected by server.
- **MongoDB Connection Unavailability**: Auto-fallback to MongoMemoryServer.
- **Page Overflow**: Handled gracefully by returning empty member array with metadata.

---

## 15. Testing Strategy

- **Database Seeder Verification**: `node src/seed.js` tested staff creation, 18 demo members, rewards, and sample transactions.
- **Automated Integration Tests**: `node src/test_api.js` executed 9 sequential HTTP test cases covering Auth, Member creation, Purchase recording, Tier upgrade, Valid redemption, Insufficient points rejection, Audit history, and Dashboard stats.
- **Frontend Build Verification**: `npm run build` verified zero Vite compilation errors.

---

## 16. Bugs Discovered & Fixes

1. **Bug**: In-memory MongoDB startup delay when local MongoDB is unreachable.
   - **Fix**: Set `serverSelectionTimeoutMS: 3000` in Mongoose connection options to trigger fast fallback to `mongodb-memory-server` within 3 seconds.
2. **Bug**: React Router state desync when navigating from Dashboard quick search to Member Directory.
   - **Fix**: Used `useSearchParams()` hook in `MemberListPage.jsx` to synchronize input field and API queries.

---

## 17. What Could Be Improved With More Time

1. Multi-location store franchise support.
2. Receipt barcode QR scanning at counter.
3. Automated Twilio SMS notification on tier upgrade.
