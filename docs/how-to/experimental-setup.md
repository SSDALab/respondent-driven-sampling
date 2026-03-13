# Experimental Setup

Before each campaign (or before testing a new deployment), run the following scripts in order to initialize the database with the data your campaign needs.

## Prerequisites

- `server/.env` is configured and all variables are filled in — see [Environment Variables](../reference/environment-variables.md)
- MongoDB is reachable from your environment (check with `npm run location -- list` in Step 2)
- You are in the `server/` directory for all commands below

```bash
cd server
```

---

## Step 1: Import locations

Survey sites (called "locations" or "hubs") must exist in the database before seeds, users, or surveys can reference them.

### Option A: Bulk import from YAML (recommended)

Create a `locations.yaml` file (see [Configuration → Locations YAML](../getting-started/configuration.md#locations-yaml-format) for the format). Then:

```bash
npm run location -- import path/to/locations.yaml
```

**Verify:** Run `npm run location -- list` and confirm all your sites appear.

### Option B: Create locations one at a time

```bash
npm run location -- create "Downtown Hub" ESTABLISHMENT ROOFTOP "123 Main St, City, ST 12345"
```

See [CLI Scripts → location](../reference/cli-scripts.md#npm-run-location) for all options.

---

## Step 2: Create a super admin

A super admin is required to log in, approve volunteer accounts, and manage the campaign. You need at least one before the app is usable.

```bash
npm run super-admin -- create John Doe john@example.com +12065551234 <locationObjectId>
```

Replace values with your own. To find a `locationObjectId`, run `npm run location -- get "Hub Name"`.

**Verify:** Run `npm run super-admin -- list` and confirm the account appears with status `APPROVED`.

See [CLI Scripts → super-admin](../reference/cli-scripts.md#npm-run-super-admin) for all options.

---

## Step 3: Generate seeds

Seeds are the initial QR codes that outreach workers distribute to participants to start referral chains. Each seed creates one survey entry point and generates a PDF page for printing.

```bash
npm run generate-seeds -- "Location Hub Name" <count>
```

**Example:**

```bash
npm run generate-seeds -- "Downtown Hub" 20
```

This will:

1. Create `<count>` seed records in MongoDB, each with a unique survey code
2. Generate a PDF at `server/src/scripts/seeds/seeds-<location>-<timestamp>.pdf`

Print this PDF and cut individual QR code pages for distribution to participants at the survey site.

**How many seeds?** A rough rule: generate 1.5–2x the number of participants you expect at each site for the first session. You can generate more mid-campaign.

**Verify:** Run `npm run location -- get "Downtown Hub"` and check the `seeds` count. Log in to the admin dashboard and verify seeds appear in the Seeds section.

See [CLI Scripts → generate-seeds](../reference/cli-scripts.md#npm-run-generate-seeds) for full usage.

---

## Step 4: Generate blank coupon templates (optional)

If your outreach plan uses physical coupon cards (with a space for a QR code sticker affixed by staff), generate blank PDF templates:

```bash
npm run generate-coupons -- 50
```

This generates a PDF of 50 blank coupon pages in `server/src/scripts/coupons/`. These are **not connected to the database** — they are physical templates for staff to label with sticker QR codes.

See [CLI Scripts → generate-coupons](../reference/cli-scripts.md#npm-run-generate-coupons) for full usage.

---

## Pre-campaign checklist

Before going live:

- [ ] All survey sites imported and verified (`npm run location -- list`)
- [ ] Super admin account created and accessible
- [ ] Seeds generated for all sites and PDFs printed
- [ ] At least one test survey completed end-to-end (from seed QR → survey submit → admin dashboard)
- [ ] 3 child QR codes visible after test survey completion
- [ ] Volunteer onboarding flow tested: sign up → admin approval → log in → scan code → survey
- [ ] `NODE_ENV=production` set in production `.env`
- [ ] Production deployment verified (see [Deployment](deployment.md))
