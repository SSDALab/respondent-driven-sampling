# Architecture

## High-level overview

The RDS App is a **monolithic React + Node.js application**. The Express backend serves the React frontend as static files in production, so the entire application is deployed as a single Azure App Service.

```
┌─────────────────────────────────────┐
│           Browser (React SPA)        │
│  Vite + TypeScript + Material-UI     │
│  Port 3000 (dev) / served by Express │
└──────────────┬──────────────────────┘
               │ HTTP API (REST)
               ▼
┌─────────────────────────────────────┐
│       Express API (Node.js)          │
│  TypeScript + Mongoose + CASL        │
│  Port 1234 (dev) / process.env.PORT  │
└──────────────┬──────────────────────┘
               │ Mongoose ODM
               ▼
┌─────────────────────────────────────┐
│           MongoDB                    │
│  Atlas (cloud) or Cosmos DB          │
└─────────────────────────────────────┘
```

**Monorepo layout:**

```
respondent-driven-sampling/
├── client/          # React SPA (Vite + TypeScript + MUI)
├── server/          # Express API (TypeScript + MongoDB)
├── docs/            # Documentation source (this site)
├── mkdocs.yml       # MkDocs configuration
└── .github/         # CI/CD workflows, issue templates
```

In development, the Vite dev server runs on port 3000 and proxies API requests to Express on port 1234. In production, Express serves the compiled React `dist/` directly.

## Backend architecture

The backend uses a **domain-driven layered structure**, distinct from typical Express apps:

```
server/src/
├── index.ts                    # App entry point; security middleware, route registration
├── middleware/
│   └── auth.ts                 # JWT verification, approval check, CASL ability injection
├── routes/
│   ├── v1/                     # Legacy routes (deprecated)
│   └── v2/                     # Current routes
│       ├── users.ts
│       ├── surveys.ts
│       ├── seeds.ts
│       └── locations.ts
├── database/
│   ├── user/
│   │   ├── mongoose/           # Mongoose model + hooks
│   │   ├── zod/                # Zod validation schemas
│   │   ├── user.controller.ts  # Business logic
│   │   └── user.utils.ts
│   ├── survey/
│   ├── seed/
│   └── location/
├── permissions/                # CASL role and attribute definitions
├── scripts/                    # CLI management scripts
└── config/                     # Swagger, constants
```

**Key pattern:** Route files (`routes/v2/*.ts`) call controller functions (`database/{domain}/*.controller.ts`). Business logic lives in controllers, not routes.

### API versioning

- **v1 routes** (`/api/auth`, `/api/surveys`): Legacy, being deprecated. Do not use for new features.
- **v2 routes** (`/api/v2/users`, `/api/v2/surveys`, `/api/v2/seeds`, `/api/v2/locations`): Current. All v2 routes use Zod validation middleware.

### Validation

All API request bodies are validated with [Zod](https://zod.dev/). Schema files:

- `zod/*.base.ts` — Full document schema (used for Mongoose typing)
- `zod/*.validator.ts` — API request validators (subset of the document schema)

```typescript
// Example: route with Zod validation
router.post('/', validate(createSurveySchema), surveysController.create);
```

## Auth flow

```
1. Volunteer enters phone number → POST /api/v2/auth/send-otp → Twilio sends SMS OTP
2. Volunteer enters OTP → POST /api/v2/auth/verify-otp → Server verifies via Twilio Verify API
3. Server returns JWT → Client stores in Zustand persistent store (localStorage)
4. All subsequent requests → Authorization: Bearer <JWT> header
5. Auth middleware:
   a. Verifies JWT signature (AUTH_SECRET)
   b. Checks approvalStatus === 'APPROVED' (403 if not)
   c. Fetches latest survey to derive user's current location
   d. Builds CASL Ability object and injects into req.authorization
```

### Approval flow

New users register with `approvalStatus: PENDING`. They can receive OTP codes but cannot access any protected routes until an admin or super-admin sets their status to `APPROVED` via the admin dashboard or the CLI.

```
PENDING → APPROVED   (admin approves in dashboard)
PENDING → REJECTED   (admin rejects)
APPROVED → PENDING   (admin can reset)
```

## Permissions (CASL)

The app uses [CASL](https://casl.js.org/) for role and attribute-based access control.

**Roles:** `super-admin`, `admin`, `volunteer`

**Key permission conditions:**

| Condition | Meaning |
|---|---|
| `IS_CREATED_BY_SELF` | The resource was created by the requesting user |
| `WAS_CREATED_TODAY` | The resource was created on the current calendar day |
| `HAS_SAME_LOCATION` | The resource belongs to the user's current location |

Example: volunteers can only update surveys they created today at their current location. Admins can update any survey at their location.

Permissions are defined in `server/src/permissions/permissions.ts` and the same constants are imported by the frontend (`client/src/hooks/useAbility.tsx`) to mirror permission checks in the UI.

## Survey referral chain

```
Seed (surveyCode: "A1B2C3D4", parentSurveyCode: null)
     │
     │ participant scans seed QR
     ▼
Survey A (surveyCode: "A1B2C3D4")
     │ generates 3 child codes on completion
     ├─► Child code "E5F6G7H8"
     ├─► Child code "I9J0K1L2"
     └─► Child code "M3N4O5P6"
           │
           │ peer scans child QR
           ▼
     Survey B (surveyCode: "E5F6G7H8", parentSurveyCode: "A1B2C3D4")
           │ generates 3 more child codes
           └─► ...
```

**Key fields in the `surveys` collection:**

| Field | Description |
|---|---|
| `surveyCode` | The code that was scanned to start this survey |
| `parentSurveyCode` | The code that referred this participant |
| `childSurveyCodes` | Array of 3 unique codes for this participant to share |

Child survey codes are 8-character hex strings, globally unique, generated with retry logic (`server/src/database/survey/survey.controller.ts: generateUniqueChildSurveyCodes`).

## Deployment architecture

In production (Azure App Service):

```
GitHub push to main branch
        │
        ▼
GitHub Actions workflow
        │
        ├─ npm run build (client) → client/dist/
        ├─ cp client/dist → server/dist/
        ├─ npm install (server)
        └─ Deploy server/ folder to Azure App Service
                │
                ▼
        Azure App Service (Node 22 LTS)
        node server/build/index.js
        Serves:
          /api/* → Express routes
          /*     → server/dist/ (React SPA)
```

## Path aliases

Both client and server use `@/*` imports:

- **Server:** `tsconfig.json` + `tsc-alias` build step resolves `@/*` → `src/*`
- **Client:** Vite resolves `@/*` → `src/*`, plus `@/permissions/*` → `../server/src/permissions/*` for shared constants

This means the client can directly import server-side permission constants without duplicating them.
