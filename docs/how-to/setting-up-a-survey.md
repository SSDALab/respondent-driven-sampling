# Setting Up a Survey

The following scripts must be run in sequence from the `server/` directory before a campaign begins or a new deployment is tested.

```bash
cd server
```

Ensure `server/.env` is fully configured and MongoDB is reachable before proceeding.

---

## 1. Import Locations

Survey sites must exist in the database before seeds, users, or surveys can reference them.

**Bulk import from YAML (recommended):**

```bash
npm run location -- import path/to/locations.yaml
```

See [Adding Survey Locations](../how-to/adding-survey-locations.md) for the YAML format.

**Single location:**

```bash
npm run location -- create "Downtown Hub" ESTABLISHMENT ROOFTOP "123 Main St, City, ST 12345"
```

**Verify:**

```bash
npm run location -- list
```

---

## 2. Create a Super Admin

```bash
npm run super-admin -- create John Doe john@example.com +12065551234 <locationObjectId>
```

The `locationObjectId` is obtained from `npm run location -- get "Hub Name"`. At least one super admin is required before the app is usable.

**Verify:**

```bash
npm run super-admin -- list
```

The account should appear with status `APPROVED`.

---

## 3. Generate Seeds

Seeds are the initial QR codes distributed to participants to start referral chains. Each seed corresponds to one survey entry point.

```bash
npm run generate-seeds -- "Location Hub Name" <count>
```

This creates `<count>` seed records in MongoDB and outputs a printable PDF to `server/src/scripts/seeds/seeds-<location>-<timestamp>.pdf`. A typical rule of thumb is to generate 1.5–2× the expected number of first-session participants per site.

---

## 4. Generate Blank Coupon Templates (Optional)

If the campaign uses physical coupon cards with QR stickers affixed by staff:

```bash
npm run generate-coupons -- 50
```

This outputs blank PDF templates to `server/src/scripts/coupons/`. These templates are not connected to the database.

---

Full options for all scripts are in [CLI Scripts](../reference/cli-scripts.md).

---

## 5. Update Survey Module

Customise the survey questionnaire for your campaign by editing `client/src/pages/Survey/utils/survey.json`. After any changes, rebuild and redeploy the client:

```bash
cd client && npm run build
```

See [Getting Started — Customise](../getting-started/getting-started.md#7-customise) for full customisation options including theme, app title, and environment variables.

---

## Pre-Campaign Checklist

- [ ] All survey sites imported and verified (`npm run location -- list`)
- [ ] Super admin account created and confirmed as `APPROVED`
- [ ] Seeds generated for all sites and PDFs printed
- [ ] At least one full end-to-end test survey completed (seed QR → survey submit → admin dashboard → 3 child codes generated)
- [ ] Volunteer onboarding flow tested: register → admin approval → log in → scan code → survey
- [ ] `NODE_ENV=production` set in the production environment
- [ ] Production deployment verified (see [Deployment](deployment.md))
