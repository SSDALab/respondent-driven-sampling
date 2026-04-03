# Environment Variables

All server runtime configuration is supplied through `server/.env`:

```bash
cp server/.env.example server/.env
```

`server/.env` is listed in `.gitignore` and must never be committed to version control.

## Variables


| Variable              | Required | Format                        | How to obtain                                                                        |
| --------------------- | -------- | ----------------------------- | ------------------------------------------------------------------------------------ |
| `NODE_ENV`            | Yes      | `development` or `production` | Set manually                                                                         |
| `MONGO_URI`           | Yes      | `mongodb+srv://...`           | Atlas: Connect → Drivers; Cosmos DB: Connection Strings                              |
| `MONGO_DB_NAME`       | Yes      | string                        | Chosen freely (e.g. `rds-seattle`)                                                   |
| `TWILIO_ACCOUNT_SID`  | Yes      | Starts with `AC`              | Twilio Console dashboard                                                             |
| `TWILIO_AUTH_TOKEN`   | Yes      | 32-char hex                   | Twilio Console dashboard                                                             |
| `TWILIO_VERIFY_SID`   | Yes      | Starts with `VA`              | Twilio Console → Verify → Services → Service SID                                     |
| `TWILIO_PHONE_NUMBER` | Optional | E.164 (e.g. `+12065551234`)   | Twilio Console → Phone Numbers (not in `.env.example`; add manually if needed)        |
| `AUTH_SECRET`         | Yes      | Random string, min 32 chars   | `openssl rand -hex 32`                                                               |
| `TIMEZONE`            | Yes      | tz database name              | See [tz database list](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) |


`TWILIO_PHONE_NUMBER` is only required for outbound bulk SMS (e.g. gift card notifications). OTP authentication via Twilio Verify does not require it.

Common timezone values: `America/Los_Angeles`, `America/Denver`, `America/Chicago`, `America/New_York`, `UTC`.

!!! danger "Rotating AUTH_SECRET"
    Changing `AUTH_SECRET` immediately invalidates all active user sessions. All logged-in users will be signed out. Coordinate  with the team before applying to production.

## Production Setup on Azure

On Azure App Service, environment variables are set as **Application settings** rather than in a `.env` file.

If the infrastructure was provisioned with Pulumi, these variables are configured automatically as App Service settings via `infra/index.ts`. See [Infrastructure](../how-to/infrastructure.md) for details.

For manual configuration:

Azure Portal → App Service → Configuration → Application settings → add each variable as a key-value pair → Save → restart the service.