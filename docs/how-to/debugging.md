# Debugging

## For Field Enumerators (Volunteers)

Common issues encountered in the field during a campaign.

### Cannot Log In

**Problem:** The login page accepts the phone number but no OTP code arrives.

- Confirm the device has cell signal or Wi-Fi.
- The phone number should be entered as a 10-digit number without a country code.
- New accounts start as **Pending** and require admin approval before the OTP flow works. The campaign coordinator can confirm approval status in the admin dashboard.
- If the issue persists, the coordinator should check the Twilio delivery logs.

**Problem:** The OTP is received but the app shows "invalid code."

- OTP codes expire after 10 minutes. Request a new code and enter it immediately.
- Ensure the most recent code is being entered, not a previously received one.

**Problem:** After login, the screen shows "Access Denied" or is blank.

- The account may not yet be approved. Contact the coordinator.
- Refresh the page. If the issue persists, log out and log back in.

---

### Survey Not Loading

**Problem:** A QR code was scanned but the survey page does not load.

- An active internet connection is required to load and submit surveys.
- Confirm the scanned QR code is from a printed seed or referral coupon, not a generic URL.
- Try opening the URL from the QR code directly in the browser.

**Problem:** Survey progress was lost after returning to the page.

- Surveys are not saved locally. If the session expires or the browser is closed, progress is lost.
- Each survey should be completed in a single sitting without closing the browser.

---

### QR Code Not Scanning

- The browser must have camera permission (the app prompts on first use).
- The QR code should be flat, undamaged, and well-lit.
- Hold the camera steady at 15–30 cm from the code and allow it to focus.
- If scanning still fails, the coupon code can be typed manually if the printed coupon shows the text code below the QR image.

---

### Referral Code Issues

**Problem:** A participant's referral coupon is not working.

- Each coupon code can only be used once. A previously used code will return an error.
- Codes are case-insensitive but must not contain extra spaces.
- If the code appears valid but returns an error, escalate to the campaign coordinator.

---

### Escalation

Issues not resolved by the steps above should be reported to the campaign coordinator or site manager. Technical issues affecting multiple devices or sites should be escalated to the development team.

---

## For Developers and Maintainers

### Running Locally

See [Getting Started](../getting-started/getting-started.md) for initial setup. The main commands:

```bash
# Backend (hot reload with tsx)
cd server && npm run dev

# Frontend (Vite dev server, port 3000)
cd client && npm run dev
```

Server logs stream to the terminal. All route errors and middleware output appear here.

---

### Common Environment Issues

**`MongoServerError: bad auth`**

- The `MONGO_URI` is incorrect or the database user credentials are wrong.
- Verify the connection string in Atlas and confirm the user has read/write access.

**`TWILIO_VERIFY_SID` errors / OTP not sending**

- Confirm `TWILIO_VERIFY_SID` starts with `VA`.
- Confirm the Verify service is active in the Twilio Console.
- Check Twilio logs at [console.twilio.com/us1/monitor/logs/messaging](https://console.twilio.com/us1/monitor/logs/messaging).

**JWT errors / "unauthorized" after login**

- Confirm `AUTH_SECRET` is set and non-empty. All existing sessions are invalidated if this value changes.
- JWT tokens expire; test by logging out and logging back in.

**Client shows blank page or `Cannot GET /`**

- In development, both the Vite dev server (port 3000) and the Express server (port 1234) must be running. Vite proxies `/api` requests to Express.
- In production, `client/dist` must be copied into `server/dist` before deploying.

---

### Running Tests and Lint

```bash
# Server tests
cd server && npm test
cd server && npm run test:coverage

# Lint (both packages)
cd client && npm run lint
cd server && npm run lint
```

---

### Known Gotchas

**Survey code uniqueness:** Survey codes are generated with a uniqueness check. Errors about duplicate codes during seed generation usually indicate the random space is exhausted for short codes — increase the code length in `generateUniqueSurveyCode`.

**SWR cache in admin dashboard:** The admin dashboard uses SWR for data fetching with a short cache window. Data may not appear immediately; wait a few seconds or hard-refresh the page.

**Soft-delete behaviour:** The `User` and `Survey` models use soft-delete via a `deletedAt` field (schema default: `null`, `select: false`). Standard queries exclude soft-deleted documents. If a user appears to have disappeared, check for soft-deletion with `npm run super-admin -- list --all`.

**CORS setting:** `server/src/index.ts` currently sets `credentials: true` with `origin: '*'`. Per the Fetch specification, this combination is technically broken for credentialed requests. See [Database and Security](database-and-security.md#cors) for details and the production fix.

---

### Pre-Commit Hooks

If pre-commit checks fail:

```bash
pre-commit run --all-files
```

To skip a check temporarily (use sparingly):

```bash
SKIP=eslint git commit -m "message"
```

See [CI / Workflows](ci.md) for the full list of hooks and checks.
