# API Overview

The RDS App exposes a REST API served by the Express backend. This page gives a high-level overview of the API structure, authentication, and main endpoints.

!!! tip "Swagger UI"
    An interactive Swagger UI is available at `/documentation` on any running instance of the app.
    - Local: [http://localhost:1234/documentation](http://localhost:1234/documentation)
    - Production: `https://your-app.azurewebsites.net/documentation`

## Base URLs

| Environment | Base URL |
|---|---|
| Local development | `http://localhost:1234` |
| Production (Azure) | `https://your-app.azurewebsites.net` |

## Authentication

All protected routes require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <JWT>
```

Obtain a token by completing the OTP flow. For new users (signup):

1. `POST /api/auth/send-otp-signup` — sends an OTP to the user's phone
2. `POST /api/auth/verify-otp-signup` — verifies the OTP, creates the account, returns a JWT

For returning users (login):

1. `POST /api/auth/send-otp-login` — sends an OTP to the user's phone
2. `POST /api/auth/verify-otp-login` — verifies the OTP, returns a JWT

The JWT is valid until `AUTH_SECRET` is rotated or the token expires.

## Endpoints

All routes are mounted under `/api/*`. There is no API versioning.

All protected routes use the same `auth` middleware, which verifies the JWT and injects a CASL `Ability` object into the request. Access control is determined by CASL ability checks, not role-specific middleware. The "Auth" column below indicates which roles are granted access by default; actual enforcement is attribute-based (see [CASL Permissions Summary](#casl-permissions-summary)).

### Auth

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/send-otp-signup` | None | Send OTP for new user registration |
| `POST` | `/api/auth/send-otp-login` | None | Send OTP for returning user login |
| `POST` | `/api/auth/verify-otp-signup` | None | Verify OTP, create account, return JWT |
| `POST` | `/api/auth/verify-otp-login` | None | Verify OTP, return JWT |

### Users

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/users` | Admin, Manager | List users (filterable by location, status) |
| `GET` | `/api/users/:id` | Admin, Manager | Get a specific user |
| `POST` | `/api/users` | Admin, Manager | Create a user (admin/manager operation) |
| `PATCH` | `/api/users/:id` | Admin, Manager | Update user (approve/reject, change location) |
| `DELETE` | `/api/users/:id` | Admin | Soft-delete a user |

### Surveys

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/surveys` | Admin, Manager, Volunteer | List surveys (scoped by CASL) |
| `GET` | `/api/surveys/:id` | Admin, Manager, Volunteer | Get a specific survey (scoped by CASL) |
| `POST` | `/api/surveys` | Admin, Manager, Volunteer | Submit a new survey |
| `PATCH` | `/api/surveys/:id` | Admin, Manager, Volunteer | Update a survey (scoped by CASL) |
| `DELETE` | `/api/surveys/:id` | Admin | Delete a survey |

### Seeds

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/seeds` | Admin, Manager, Volunteer | List seeds |
| `GET` | `/api/seeds/:id` | Admin, Manager, Volunteer | Get a specific seed |
| `POST` | `/api/seeds` | Admin, Manager, Volunteer | Create a seed |
| `DELETE` | `/api/seeds/:id` | Admin | Delete a seed |

Seeds are typically created via the `npm run generate-seeds` CLI script, not the API directly.

### Locations

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/locations` | None | List all locations |
| `GET` | `/api/locations/:id` | Authenticated | Get a specific location |
| `POST` | `/api/locations` | Admin | Create a location |
| `PATCH` | `/api/locations/:id` | Admin | Update a location |
| `DELETE` | `/api/locations/:id` | Admin | Delete a location |

### Other

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/validate-referral-code/:code` | Authenticated | Validate a referral code |

## Error Responses

Most error responses return only a `message` field:

```json
{
  "message": "Human-readable error description"
}
```

Zod validation errors (HTTP 400) additionally include a `code` field with a machine-readable error constant.

Common HTTP status codes:

| Code | Meaning |
|---|---|
| `400` | Bad request — validation error (Zod) |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — approval status check failed, or CASL permission denied |
| `404` | Not found |
| `409` | Conflict — duplicate resource (e.g. phone already registered) |
| `500` | Internal server error |

## CASL Permissions Summary

The API enforces permissions using [CASL](https://casl.js.org/). Key access rules:

| Role | Can Do |
|---|---|
| **Super Admin** | Everything; manage all users across all locations |
| **Admin** | Read all users; approve/create volunteers, managers, and admins; manage surveys created today; create and read seeds |
| **Manager** | Read all users; approve volunteers at own location created today; create and read surveys at own location today; create and read seeds |
| **Volunteer** | Read and update own profile; create surveys; read and update own surveys created today at own location; create and read seeds |
| **Unauthenticated** | List locations; complete OTP signup/login flow |
