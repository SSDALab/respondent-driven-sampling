# Plan: Address Anant's PR #196 Comments on api.md, database-and-security.md, and architecture.md

---

**Date:** 2026-02-20
**Status:** Draft
**PR:** #196
**Scope:** `docs/reference/api.md`, `docs/how-to/database-and-security.md`, and `docs/reference/architecture.md`

---

## Overview

Anant flagged factual inaccuracies in two documentation files. All comments have been verified against the server source code and are correct. This plan addresses every issue.

## Changes to `docs/reference/api.md`

### 1. Remove fake API versioning (Critical)

There is no v1/v2 versioning. All routes are mounted at `/api/*`. Remove the "API Versioning" section entirely. Remove all `/api/v2/` prefixes from endpoint tables — replace with `/api/`.

### 2. Fix auth endpoints (Critical)

Replace the two generic OTP endpoints with the actual four:

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/send-otp-signup` | None | Send OTP for new user registration |
| `POST` | `/api/auth/send-otp-login` | None | Send OTP for returning user login |
| `POST` | `/api/auth/verify-otp-signup` | None | Verify OTP, create account, return JWT |
| `POST` | `/api/auth/verify-otp-login` | None | Verify OTP, return JWT |

Update the "Authentication" intro text to reference these paths.

### 3. Fix Swagger UI path (Critical)

Change `/api-docs` to `/documentation`. Update URL to `http://localhost:1234/documentation`.

### 4. Fix `POST /users` auth requirement

Change Auth from "None" to "Admin" and update Purpose from "Register a new user" to "Create a user (admin operation)."

### 5. Fix `GET /locations/:id` auth

Change Auth from "Any" to "Authenticated."

### 6. Fix Surveys auth labels

GET and POST surveys are accessible by Admin, Manager, and Volunteer (scoped by CASL). Update Auth column to reflect all three roles, not just one.

### 7. Add MANAGER role

Add row to CASL table: **Manager** — Approve volunteers at own location; manage surveys at own location for the current day.

### 8. Fix error response format

Remove `code` field from the generic error shape. Note that `code` only appears in Zod validation errors (HTTP 400).

### 9. Add missing endpoint: `validate-referral-code`

Add to a new "Other" section or append to the endpoints:

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/validate-referral-code/:code` | Authenticated | Validate a referral code |

### 10. Simplify Auth column description

Add a note below the endpoint tables clarifying that all protected routes use the same `auth` middleware + CASL ability checks (not role-specific middleware).

## Changes to `docs/how-to/database-and-security.md`

### 11. Fix CORS description

Replace "acceptable for development" with a note that `credentials: true` + `origin: '*'` is technically broken per the Fetch spec. Add a reference to tracking this as a separate issue.

### 12. Fix Locations collection description

Change "hub name, type, and address" to "hub name, hub type, location type, and address" — there are two distinct type fields (`hubType`, `locationType`).

### 13. Expand collection field summaries

Add notable omissions to each collection row:

- **users:** add `firstName`, `lastName`, `permissions`, `approvedByUserObjectId`
- **surveys:** add `locationObjectId`, `createdByUserObjectId`, `coordinates`, `isCompleted`, `deletedAt` (soft-delete)
- **seeds:** add `isFallback`
- **locations:** clarify two type fields

### 14. Add missing env vars to secrets table

Add `TWILIO_ACCOUNT_SID` and `TWILIO_VERIFY_SID` to the critical variables table.

### 15. Expand production checklist

Add two items:
- `[ ]` CORS `origin` is set to the specific frontend URL (not `*`)
- `[ ]` `TWILIO_ACCOUNT_SID` and `TWILIO_VERIFY_SID` are configured

## Changes to `docs/reference/architecture.md`

Anant flagged "a ton of hallucinations." Verified against the actual `server/src/` directory structure. The following are incorrect:

### 16. Remove fake `routes/v1/` and `routes/v2/` directory tree (Critical)

The directory tree shows `routes/v1/` (legacy) and `routes/v2/` (current) subdirectories. These do not exist. The actual structure is flat:

```
server/src/routes/
├── auth.ts
├── locations.ts
├── seeds.ts
├── surveys.ts
├── users.ts
└── validateReferralCode.ts
```

Replace the hallucinated tree with the real one. Also add `validateReferralCode.ts` which is missing.

### 17. Remove fake `user.utils.ts` from directory tree

The tree shows `database/user/user.utils.ts`. This file does not exist. The actual contents of `database/user/` are: `mongoose/`, `zod/`, and `user.controller.ts`.

### 18. Fix the "API Versioning" section

Same as item 1 — the architecture doc also claims v1/v2 routes exist. Remove this entire section and replace with a note that all routes are mounted at `/api/*` with no versioning.

### 19. Fix the "Key pattern" description

The text says "Route files (`routes/v2/*.ts`) call controller functions." Should be "Route files (`routes/*.ts`) call controller functions."

### 20. Fix auth flow endpoints

Lines 93–94 reference `POST /api/v2/auth/send-otp` and `POST /api/v2/auth/verify-otp`. Replace with the actual four endpoints (`send-otp-signup`, `send-otp-login`, `verify-otp-signup`, `verify-otp-login`) at `/api/auth/`.

### 21. Fix Permissions roles list

Line 118 lists roles as `super-admin`, `admin`, `volunteer`. Actual constants are `SUPER_ADMIN`, `ADMIN`, `MANAGER`, `VOLUNTEER`. Add MANAGER and use the correct casing.

### 22. Fix deployment branch reference

Line 171 says "GitHub push to main branch." The actual deployment branches are `kc-pit-2026` (prod) and `kc-pit-2026-test` (test), triggered by the `azure-webapp-deploy-*.yml` workflows, not pushes to `main`.

## What We're NOT Doing

- Not rewriting any file from scratch — surgical fixes only.
- Not addressing Ihsan's comments on other files (separate task).

## Success Criteria

### Automated Verification

- [x] No `/api/v2/` or `/api/v1/` strings in `docs/reference/api.md`
- [x] No `/api-docs` string in `docs/reference/api.md`
- [x] String `MANAGER` appears in `docs/reference/api.md`
- [x] String `validate-referral-code` appears in `docs/reference/api.md`
- [x] String `TWILIO_ACCOUNT_SID` appears in `docs/how-to/database-and-security.md`
- [x] String `hubType` appears in `docs/how-to/database-and-security.md`
- [x] String `isFallback` appears in `docs/how-to/database-and-security.md`
- [x] No `routes/v1/` or `routes/v2/` strings in `docs/reference/architecture.md`
- [x] No `/api/v2/` strings in `docs/reference/architecture.md`
- [x] String `MANAGER` appears in `docs/reference/architecture.md`
- [x] String `validateReferralCode` appears in `docs/reference/architecture.md`
- [x] No `user.utils.ts` string in `docs/reference/architecture.md`

### Manual Verification

- [ ] Re-request review from Anant on all three files
- [ ] Each of Anant's comments is addressed

---
