# API Overview

The RDS App exposes a REST API served by the Express backend. This page gives a high-level overview of the API structure, authentication, and main endpoints.

!!! tip "Swagger UI"
    An interactive Swagger UI is available at `/api-docs` on any running instance of the app. This provides a live, explorable view of all endpoints with request/response schemas.
    - Local: [http://localhost:1234/api-docs](http://localhost:1234/api-docs)
    - Production: `https://your-app.azurewebsites.net/api-docs`

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

Obtain a token by completing the OTP login flow:

1. `POST /api/v2/auth/send-otp` — sends an OTP to the user's phone
2. `POST /api/v2/auth/verify-otp` — verifies the OTP, returns a JWT

The JWT is valid until `AUTH_SECRET` is rotated or the token expires.

## API versioning

### v1 routes (legacy — deprecated)

| Path | Purpose |
|---|---|
| `/api/auth` | Authentication (v1) |
| `/api/surveys` | Survey operations (v1) |

v1 routes are being phased out. Do not use them for new integrations.

### v2 routes (current)

All new development uses v2 routes at `/api/v2/*`.

## Main v2 endpoints

### Auth

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `POST` | `/api/v2/auth/send-otp` | None | Send OTP to phone number |
| `POST` | `/api/v2/auth/verify-otp` | None | Verify OTP, receive JWT |

### Users

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v2/users` | Admin | List users (filterable by location, status) |
| `GET` | `/api/v2/users/:id` | Admin | Get a specific user |
| `POST` | `/api/v2/users` | None | Register a new user (creates with PENDING status) |
| `PATCH` | `/api/v2/users/:id` | Admin | Update user (approve/reject, change location) |
| `DELETE` | `/api/v2/users/:id` | Admin | Soft-delete a user |

### Surveys

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v2/surveys` | Admin | List surveys (filterable by location, date) |
| `GET` | `/api/v2/surveys/:id` | Admin | Get a specific survey |
| `POST` | `/api/v2/surveys` | Volunteer | Submit a new survey |
| `PATCH` | `/api/v2/surveys/:id` | Volunteer\* | Update own survey (same-day, same-location) |
| `DELETE` | `/api/v2/surveys/:id` | Admin | Delete a survey |

\* Volunteers can only update surveys they created today at their current location (CASL permission check).

### Seeds

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v2/seeds` | Admin | List seeds |
| `GET` | `/api/v2/seeds/:id` | Admin | Get a specific seed |
| `POST` | `/api/v2/seeds` | Admin | Create a seed manually |
| `DELETE` | `/api/v2/seeds/:id` | Admin | Delete a seed |

Seeds are typically created via the `npm run generate-seeds` CLI script, not the API directly.

### Locations

| Method | Path | Auth | Purpose |
|---|---|---|---|
| `GET` | `/api/v2/locations` | Any | List all locations |
| `GET` | `/api/v2/locations/:id` | Any | Get a specific location |
| `POST` | `/api/v2/locations` | Admin | Create a location |
| `PATCH` | `/api/v2/locations/:id` | Admin | Update a location |
| `DELETE` | `/api/v2/locations/:id` | Admin | Delete a location |

## Error responses

All error responses follow this shape:

```json
{
  "message": "Human-readable error description",
  "code": "ERROR_CODE_CONSTANT"
}
```

Common HTTP status codes:

| Code | Meaning |
|---|---|
| `400` | Bad request — validation error (Zod) |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — approved status check failed, or CASL permission denied |
| `404` | Not found |
| `409` | Conflict — duplicate resource (e.g. phone already registered) |
| `500` | Internal server error |

## CASL permissions summary

The API enforces permissions using [CASL](https://casl.js.org/). Key access rules:

| Role | Can do |
|---|---|
| **Super admin** | Everything; can manage all users across all locations |
| **Admin** | Manage surveys, seeds, and users at their location |
| **Volunteer** | Submit surveys; update own surveys created today at their location |
| **Unauthenticated** | View locations; register as new user; receive OTP |
