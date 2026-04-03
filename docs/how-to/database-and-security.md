# Database and Security

## Database Overview

The RDS App uses **MongoDB** as its data store. All collections reside in a single database (configured via `MONGO_DB_NAME`).

### Collections

| Collection | Purpose |
|---|---|
| `users` | Volunteer, manager, and admin accounts. Fields: `firstName`, `lastName`, `phone`, `email`, `role`, `locationObjectId`, `approvalStatus`, `approvedByUserObjectId`, `permissions` (CASL action/subject/conditions array), `deletedAt` (soft-delete). |
| `locations` | Survey site records. Fields: `hubName`, `hubType`, `locationType`, `address`. Note: `hubType` and `locationType` are separate enum fields. |
| `surveys` | Individual survey submissions. Fields: `surveyCode`, `parentSurveyCode`, `childSurveyCodes`, `responses`, `locationObjectId`, `createdByUserObjectId`, `coordinates` (lat/lng), `isCompleted`, `deletedAt` (soft-delete), timestamps. |
| `seeds` | Initial QR codes distributed by outreach workers. Fields: `surveyCode`, `locationObjectId`, `isFallback`. |

The codebase organises each collection into a domain folder under `server/src/database/<domain>/` with co-located Mongoose models and Zod schemas. See [Architecture](../reference/architecture.md#backend-architecture) for the full layout.

## Exporting and Importing Data

See [Database I/O](../reference/database-io.md) for `mongoexport` / `mongoimport` commands.

## Secrets and Environment Security

### What Must Stay Secret

All values in `server/.env` are sensitive. This file is in `.gitignore` and must never be committed.

The most critical variables:

| Variable | Risk if exposed |
|---|---|
| `AUTH_SECRET` | Allows forging JWT tokens and impersonating any user |
| `MONGO_URI` | Full database access including all survey data and PII |
| `TWILIO_ACCOUNT_SID` | Identifies the Twilio account; required for all Twilio API operations |
| `TWILIO_AUTH_TOKEN` | Enables sending SMS from the Twilio number and draining account balance |
| `TWILIO_VERIFY_SID` | Identifies the Twilio Verify service; allows initiating OTP verification flows |

### Rotating Secrets

If a secret is accidentally exposed:

1. **`AUTH_SECRET`:** Change the value in `.env` and in the production environment config. All existing user sessions are immediately invalidated.
2. **`MONGO_URI` / database credentials:** Rotate the database user password in MongoDB Atlas, update `.env`, and redeploy.
3. **`TWILIO_AUTH_TOKEN`:** Regenerate the token in the Twilio Console and update `.env`.

### Production Checklist

- [ ] `NODE_ENV=production` is set
- [ ] `AUTH_SECRET` is a strong random string (at least 32 characters; generate with `openssl rand -hex 32`)
- [ ] `.env` is NOT committed to the repository
- [ ] MongoDB Atlas IP allowlist is restricted (not `0.0.0.0/0`)
- [ ] MongoDB Atlas user has only the required permissions (readWrite on the app database, not `atlasAdmin`)
- [ ] CORS `origin` is set to the specific frontend URL (not `*`); see [CORS](#cors) below
- [ ] `TWILIO_ACCOUNT_SID` and `TWILIO_VERIFY_SID` are configured

### CORS

The server currently sets `credentials: true` with `origin: '*'` in `server/src/index.ts`. Per the [Fetch specification](https://fetch.spec.whatwg.org/#http-access-control-allow-origin), browsers silently reject credentialed requests when `origin` is `*`, so this configuration is technically broken for any request that sends credentials. This should be tracked and fixed as a separate issue.

For production, restrict the origin to the specific frontend URL:

```typescript
app.use(cors({ origin: 'https://your-azure-app.azurewebsites.net', credentials: true }));
```

### Security Headers

`server/src/index.ts` uses [Helmet.js](https://helmetjs.github.io/) to set standard security headers (CSP, HSTS, etc.). The Helmet middleware should not be modified or removed without reviewing the security implications.

## HUD and HIPAA Compliance Notes

The app collects survey data about people experiencing homelessness. This data may be subject to:

- **HUD (U.S. Department of Housing and Urban Development)** data collection standards for Point-in-Time counts.
- **Local or state data privacy regulations** — consult with legal counsel before deploying in a new jurisdiction.

The app does not currently implement encryption at rest for MongoDB collections. If a jurisdiction requires encrypted PII at rest, configure [MongoDB Atlas encryption at rest](https://www.mongodb.com/docs/atlas/security/encryption-at-rest/) in the Atlas project settings.
