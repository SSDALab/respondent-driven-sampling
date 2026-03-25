# Getting Started

## Prerequisites

**Accounts required:**

- **GitHub** — to fork the repository and use GitHub Actions for CI/CD. [Fork the repository](https://github.com/uw-ssec/respondent-driven-sampling/fork).
- **MongoDB** — all survey data is stored in MongoDB. [MongoDB Atlas](https://www.mongodb.com/atlas) (free M0 tier) is recommended. The connection string (`MONGO_URI`) and database name (`MONGO_DB_NAME`) come from the chosen provider.
- **Twilio** — OTP authentication for volunteer logins via Twilio Verify. Requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and a Verify service SID (`TWILIO_VERIFY_SID`). `TWILIO_PHONE_NUMBER` is only needed for outbound bulk SMS.
- **Azure App Service** (or any Node.js host) — King County uses Azure; see [Deployment](../how-to/deployment.md) for specifics.

**Local tools:**

| Tool | Version |
|---|---|
| Node.js | 22.x |
| npm | bundled with Node |
| Git | any recent |
| Python 3.x | 3.9+ (for docs only) |

---

## 1. Fork and clone

Fork the repository on GitHub, then clone locally:

```bash
git clone https://github.com/YOUR-ORG/respondent-driven-sampling.git
cd respondent-driven-sampling
```

---

## 2. Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

---

## 3. Configure environment variables

```bash
cp server/.env.example server/.env
```

The file must live at `server/.env` (next to `package.json`), not inside `server/src/`.

Fill in `server/.env`:

```dotenv
NODE_ENV=development
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
MONGO_DB_NAME=rds-king-county
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxx
TWILIO_VERIFY_SID=VAxxxxxxxxxxxxxxxxxx
AUTH_SECRET=<output of: openssl rand -hex 32>
TIMEZONE=America/Los_Angeles
```

The MongoDB connection string is obtained from Atlas via **Connect > Drivers**. Full variable descriptions are in [Environment Variables](../reference/environment-variables.md).

`server/.env` is listed in `.gitignore` and must never be committed to version control.

---

## 4. Run locally

Start backend and frontend in separate terminals:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

The frontend is available at [http://localhost:3000](http://localhost:3000). The login page will load, but authentication requires the database to be initialised first.

---

## 5. Initialise the database

The database must be seeded with locations, at least one super admin account, and initial QR code seeds before the app is functional. Follow the step-by-step instructions in [Setting Up a Survey](../how-to/setting-up-a-survey.md).

---

## 6. Verify

1. Open [http://localhost:3000](http://localhost:3000).
2. Log in with the phone number used when creating the super admin.
3. Confirm the super admin dashboard is accessible.
4. Confirm the Users section shows the admin account as `APPROVED`.

New volunteers who register via the app appear with status `PENDING` until approved by an admin.

For a pre-deployment end-to-end test, see the checklist in [Setting Up a Survey](../how-to/setting-up-a-survey.md#pre-campaign-checklist).

---

## 7. Customise

- **Survey questions:** edit `client/src/pages/Survey/utils/survey.json`. Changes require a client rebuild (`cd client && npm run build`) and redeploy.
- **Theme:** `client/src/theme/muiTheme.ts` via MUI `createTheme`.
- **App title and favicon:** `client/index.html`.
- **Environment variables:** see [Environment Variables](../reference/environment-variables.md).

## 8. Deploy

See [Deployment](../how-to/deployment.md) for Azure App Service instructions.
