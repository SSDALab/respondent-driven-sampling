# Debugging

## For field enumerators (volunteers)

This section covers common issues that volunteers (enumerators) encounter in the field during a campaign.

### Can't log in

**Problem:** The login page accepts my phone number but I never receive an OTP code.

- Check that you have a cell signal or Wi-Fi connection.
- Verify the phone number is in the correct format (just the 10-digit number; no country code needed on the login form).
- Ask your campaign coordinator to confirm your account has been **approved** in the admin dashboard. New accounts start as Pending and require admin approval before the OTP flow will work.
- If the issue persists, contact your campaign coordinator to check the Twilio delivery logs.

**Problem:** I receive the OTP but the app shows "invalid code."

- OTP codes expire after 10 minutes. Request a new one and enter it immediately.
- Make sure you are entering the most recent code (not a previously received one).

**Problem:** After logging in I see "Access Denied" or a blank page.

- Your account may not yet be approved. Contact your coordinator.
- Try refreshing the page. If the issue persists, log out and back in.

---

### Survey not loading

**Problem:** I scanned a QR code but the survey page won't load.

- Check your internet connection. The app requires an active connection to submit surveys.
- Confirm you scanned the correct QR code (the one from a printed seed or referral coupon, not a generic URL).
- Try opening the URL from the QR code directly in your browser.

**Problem:** The survey loaded but my progress was lost when I came back.

- Surveys are not saved locally; if the session expires or the browser is closed, progress is lost.
- Complete each survey in a single sitting without closing the browser.

---

### QR code not scanning

- Ensure the camera has permission to access the QR scanner in the browser (the app will prompt; tap "Allow").
- Make sure the QR code is flat, undamaged, and well-lit.
- Hold the camera steady at 15–30 cm from the code and wait a moment for it to focus.
- If scanning still fails, you can type the coupon code manually if the printed coupon shows the text code below the QR image.

---

### Referral code issues

**Problem:** A participant says their referral coupon isn't working.

- Each coupon code can only be used once. If it has already been used, it will show an error.
- Verify the code is being entered correctly (case-insensitive, but no extra spaces).
- Contact the campaign coordinator if the code is showing as invalid but hasn't been used.

---

### Who to contact

If an issue isn't resolved by the steps above, contact your campaign coordinator or site manager. For technical issues that persist across multiple devices or sites, escalate to the development team.

---

## For developers and maintainers

### Running locally

See the [Quickstart](../getting-started/quickstart.md) for initial setup. Once set up, the main commands are:

```bash
# Backend (hot reload with tsx)
cd server && npm run dev

# Frontend (Vite dev server, port 3000)
cd client && npm run dev
```

Server logs stream to the terminal. All route errors and middleware output appear here.

---

### Common environment issues

**`MongoServerError: bad auth`**

- Your `MONGO_URI` is incorrect or the database user credentials are wrong.
- Verify the connection string in Atlas and that the user has read/write access.

**`TWILIO_VERIFY_SID` errors / OTP not sending**

- Confirm `TWILIO_VERIFY_SID` starts with `VA`.
- Confirm the Verify service is active in the Twilio Console.
- Check Twilio logs at [console.twilio.com/us1/monitor/logs/messaging](https://console.twilio.com/us1/monitor/logs/messaging).

**JWT errors / "unauthorized" after login**

- Check that `AUTH_SECRET` is set and non-empty. All existing sessions are invalidated if this value changes.
- JWT tokens expire; test by logging out and back in.

**Client shows blank page or `Cannot GET /`**

- In development, make sure the Vite dev server is running on port 3000. The Express server proxies to it in dev mode.
- In production, ensure `client/dist` has been copied into `server/dist` before deploying.

---

### Running tests and lint

```bash
# Server tests
cd server && npm test
cd server && npm run test:coverage

# Lint (both packages)
cd client && npm run lint
cd server && npm run lint
```

---

### Known gotchas

**Survey code uniqueness:** Survey codes are generated with a uniqueness check. If you see errors about duplicate codes during seed generation, it usually means the random space is exhausted for short codes — increase the code length in `generateUniqueSurveyCode`.

**SWR cache in admin dashboard:** The admin dashboard uses SWR for data fetching with a short cache window. If you expect data to appear but don't see it, wait a few seconds or hard-refresh the page. Stale-while-revalidate means the cached data is shown first, then updated.

**Mongoose middleware hooks:** The `User` model has soft-delete logic via `deletedAt`. Queries that don't explicitly include `deletedAt: null` or use the `findWithDeleted` helper will only return non-deleted documents. If a user "disappears" unexpectedly, check if they were soft-deleted and use `npm run super-admin -- list --all` to see all users including deleted ones.

**CORS setting:** `server/src/index.ts` currently sets CORS to `'*'`. This is fine for development and internal-network-only deployments, but should be changed to the specific frontend URL before any public-facing production deployment.

---

### Pre-commit hooks

If pre-commit checks are failing:

```bash
pre-commit run --all-files
```

To skip a check temporarily (use sparingly):

```bash
SKIP=eslint git commit -m "your message"
```

See [CI / Workflows](ci.md) for what each hook checks.
