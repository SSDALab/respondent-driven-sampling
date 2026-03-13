# Environment Variables

All runtime configuration for the server is done through `server/.env`. Copy the example file to get started:

```bash
cp server/.env.example server/.env
```

Never commit `server/.env` to version control. It is listed in `.gitignore`.

## Variables reference

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | Yes | Set to `development` locally, `production` on the server |
| `MONGO_URI` | Yes | MongoDB connection string (see below) |
| `MONGO_DB_NAME` | Yes | Name of the MongoDB database to use |
| `TWILIO_ACCOUNT_SID` | Yes | Your Twilio account identifier |
| `TWILIO_AUTH_TOKEN` | Yes | Your Twilio API token |
| `TWILIO_VERIFY_SID` | Yes | SID of your Twilio Verify service (starts with `VA`) |
| `TWILIO_PHONE_NUMBER` | SMS only | From-number for outbound SMS (E.164 format, e.g. `+12065551234`) |
| `AUTH_SECRET` | Yes | JWT signing secret — keep this private and strong |
| `TIMEZONE` | Yes | tz database name for date handling (e.g. `America/Los_Angeles`) |

## Variable details

### `NODE_ENV`

```dotenv
NODE_ENV=development
```

Controls Express behavior: `development` enables verbose error messages; `production` suppresses stack traces in API responses. Always set to `production` on deployed servers.

---

### `MONGO_URI`

```dotenv
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
```

Full MongoDB connection string including credentials. Obtain from:
- **MongoDB Atlas:** Cluster dashboard → Connect → Drivers → copy the connection string
- **Azure Cosmos DB (MongoDB API):** Connection Strings section in the Azure Portal

---

### `MONGO_DB_NAME`

```dotenv
MONGO_DB_NAME=rds-king-county
```

The name of the database within the MongoDB instance. Choose a meaningful name for your city (e.g. `rds-seattle`, `rds-portland`). Multiple cities can share a MongoDB cluster by using different database names.

---

### `TWILIO_ACCOUNT_SID`

```dotenv
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Starts with `AC`. Found on your [Twilio Console dashboard](https://console.twilio.com/).

---

### `TWILIO_AUTH_TOKEN`

```dotenv
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Found on your Twilio Console dashboard alongside the Account SID. Treat this like a password — rotate it if exposed.

---

### `TWILIO_VERIFY_SID`

```dotenv
TWILIO_VERIFY_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Starts with `VA`. Found in Twilio Console → **Verify → Services** → click your service → Service SID.

If you don't have a Verify service yet, create one in the Twilio Console (Verify → Services → Create new Service).

---

### `TWILIO_PHONE_NUMBER`

```dotenv
TWILIO_PHONE_NUMBER=+12065551234
```

Only required if you are sending outbound SMS messages to survey participants (e.g. gift card notifications). The number must be in [E.164 format](https://www.twilio.com/docs/glossary/what-e164) and owned by your Twilio account.

OTP verification (the volunteer login flow) uses Twilio Verify and does **not** require this variable.

---

### `AUTH_SECRET`

```dotenv
AUTH_SECRET=your-long-random-secret-string
```

Used to sign and verify JWT tokens. This must be:
- A long, unpredictable random string (at least 32 characters)
- Different between development and production environments
- Never committed to source control

Generate a strong secret:

```bash
openssl rand -hex 32
```

!!! danger "Rotating AUTH_SECRET"
    Changing this value invalidates all existing user sessions. Every logged-in user will be logged out. Coordinate this with your team if rotating in production.

---

### `TIMEZONE`

```dotenv
TIMEZONE=America/Los_Angeles
```

A [tz database timezone name](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) used for date calculations (e.g., "was this survey created today?"). Set this to the timezone of your survey city.

Common values:

| City | Timezone |
|---|---|
| Seattle / Los Angeles | `America/Los_Angeles` |
| Denver | `America/Denver` |
| Chicago | `America/Chicago` |
| New York | `America/New_York` |
| UTC | `UTC` |
| London | `Europe/London` |

## Production environment setup

On Azure App Service, set these as **Application settings** (not in a `.env` file):

1. Azure Portal → App Service → **Configuration → Application settings**
2. Add each variable as a key-value pair
3. Save and restart the service

This is equivalent to environment variables and more secure than a `.env` file in production.
