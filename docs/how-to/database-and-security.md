# Database and Security

## Database overview

The RDS App uses **MongoDB** as its data store. All collections are in a single database (configured via `MONGO_DB_NAME`).

### Collections

| Collection | Purpose |
|---|---|
| `users` | Volunteer and admin accounts. Includes phone, email, role, location, approval status, and soft-delete timestamp. |
| `locations` | Survey site records. Includes hub name, type, address. |
| `surveys` | Individual survey submissions. Includes surveyCode, parentSurveyCode, childSurveyCodes, responses, timestamps. |
| `seeds` | Initial QR codes distributed by outreach workers. Each seed has a unique surveyCode and is tied to a location. |

### Domain-driven layout

In the codebase, each MongoDB collection has a corresponding domain folder under `server/src/database/<domain>/`:

```
server/src/database/
├── user/
│   ├── mongoose/   # Mongoose model and schema
│   └── zod/        # Zod validation schemas
├── survey/
├── seed/
└── location/
```

This structure keeps models, schemas, and validation co-located per domain.

## Exporting and importing data

See [Database Migration](../reference/database-migration.md) for the `mongoexport` / `mongoimport` commands used to migrate data between Atlas clusters or back up collections.

## Secrets and environment security

### What must stay secret

All values in `server/.env` are sensitive. Never commit this file to version control (it is in `.gitignore`).

The most critical variables:

| Variable | Risk if exposed |
|---|---|
| `AUTH_SECRET` | Anyone with this value can forge JWT tokens and impersonate any user |
| `MONGO_URI` | Full database access including all survey and PII data |
| `TWILIO_AUTH_TOKEN` | Attacker can send SMS from your Twilio number and drain account balance |

### Rotating secrets

If a secret is accidentally exposed:

1. **`AUTH_SECRET`:** Change the value in `.env` (and in your production environment config). All existing user sessions will immediately be invalidated (users must log in again).
2. **`MONGO_URI` / database credentials:** Rotate the database user password in MongoDB Atlas, update `.env`, and redeploy.
3. **`TWILIO_AUTH_TOKEN`:** Regenerate the token in the Twilio Console and update `.env`.

### Production checklist

Before deploying to production:

- [ ] `NODE_ENV=production` is set
- [ ] `AUTH_SECRET` is a strong random string (at least 32 characters; use `openssl rand -hex 32` to generate one)
- [ ] `.env` is NOT committed to the repository
- [ ] MongoDB Atlas IP allowlist is restricted (do not use `0.0.0.0/0` in production)
- [ ] MongoDB Atlas user has only the permissions it needs (readWrite on the app database, not `atlasAdmin`)

### CORS

The server currently sets `Access-Control-Allow-Origin: *` in `server/src/index.ts`. This is intentional for development flexibility, but should be changed to the specific frontend URL before any public-facing deployment:

```typescript
// server/src/index.ts — change for production
app.use(cors({ origin: 'https://your-azure-app.azurewebsites.net' }));
```

### Security headers

`server/src/index.ts` uses [Helmet.js](https://helmetjs.github.io/) to set standard security headers (CSP, HSTS, etc.). Do not modify or remove the Helmet middleware without reviewing the security implications with the SSEC team.

## HUD and HIPAA compliance notes

As stated in the README: the app is used to collect survey data about people experiencing homelessness. This data may be subject to:

- **HUD (U.S. Department of Housing and Urban Development)** data collection standards for Point-in-Time counts.
- **Local or state data privacy regulations** — check with your legal team before deploying in your jurisdiction.

The app does not currently implement encryption at rest for the MongoDB collections. If your jurisdiction requires encrypted PII at rest, configure [MongoDB Atlas encryption at rest](https://www.mongodb.com/docs/atlas/security/encryption-at-rest/) in your Atlas project settings.
