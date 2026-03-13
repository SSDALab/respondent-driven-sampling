# Quickstart: Fork to First Campaign

This guide walks a new city through going from zero to a working RDS App deployment. Estimated time: **1–2 hours** for a developer familiar with Node.js and cloud infrastructure.

Before starting, complete all steps in [Prerequisites](prerequisites.md).

---

## Step 1: Fork and clone the repository

1. Visit [github.com/uw-ssec/respondent-driven-sampling](https://github.com/uw-ssec/respondent-driven-sampling) and click **Fork**.
2. Clone your fork locally:

```bash
git clone https://github.com/YOUR-ORG/respondent-driven-sampling.git
cd respondent-driven-sampling
```

---

## Step 2: Install dependencies

```bash
cd client && npm install
cd ../server && npm install
```

---

## Step 3: Set up MongoDB

If using MongoDB Atlas:

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com).
2. Create a database user with read/write access.
3. Add your IP address (or `0.0.0.0/0` for development) to the IP allowlist.
4. From the Atlas dashboard, click **Connect → Drivers** and copy the connection string. It will look like:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   ```
5. Note the connection string (`MONGO_URI`) and choose a database name (`MONGO_DB_NAME`, e.g. `rds-your-city`).

---

## Step 4: Configure environment variables

```bash
cp server/.env.example server/.env
```

Open `server/.env` and fill in each variable:

```dotenv
NODE_ENV=development
MONGO_URI=mongodb+srv://...       # From Step 3
MONGO_DB_NAME=rds-your-city       # Your chosen database name
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxx  # From Twilio Console
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxx # From Twilio Console
TWILIO_VERIFY_SID=VAxxxxxxxxxxxxxxxxxx  # From Twilio Verify service
AUTH_SECRET=a-long-random-secret-string  # Any secure random string
TIMEZONE=America/Los_Angeles      # Your timezone
```

See [Environment Variables](../reference/environment-variables.md) for full descriptions of each variable.

!!! warning "Never commit `.env`"
    The `.env` file is in `.gitignore`. Never add it to version control — it contains secrets that would compromise your database and auth.

---

## Step 5: Run the app locally

In separate terminals:

```bash
# Terminal 1 — backend
cd server && npm run dev

# Terminal 2 — frontend
cd client && npm run dev
```

The frontend will be available at [http://localhost:3000](http://localhost:3000).

You will see the login page. Before you can log in, you need to create the initial data in Step 6.

---

## Step 6: Initialize the database

Run the following setup scripts **in order** from the `server/` directory. These only need to be run once (or once per campaign).

### 6a. Import locations

Create a `locations.yaml` file in `server/src/scripts/` with your survey site information. See [Onboarding Localities](../how-to/onboarding-localities.md) for the YAML format. Then import it:

```bash
cd server
npm run location -- import ../server/src/scripts/locations.yaml
```

### 6b. Create a super admin

```bash
npm run super-admin -- create --name "Your Name" --phone "+12065551234" --location "Location Hub Name"
```

Replace the values with your own. The phone number must be in E.164 format. This will be the account you use to log in and approve other users.

### 6c. Generate seeds

Seeds are the initial QR codes distributed by outreach workers to start referral chains. Generate a batch for each location:

```bash
npm run generate-seeds -- "Location Hub Name" 10
```

This creates 10 seed records in MongoDB and generates a PDF of QR codes in `server/src/scripts/seeds/`. Print and distribute these PDFs at your survey sites.

### 6d. Generate blank coupon templates (optional)

If you want physical blank coupon templates (with a space for a QR code sticker), you can generate a PDF:

```bash
npm run generate-coupons -- 50
```

See [CLI Scripts](../reference/cli-scripts.md) for all options.

---

## Step 7: Verify the app works

1. Open [http://localhost:3000](http://localhost:3000) in a browser.
2. Enter the phone number you used in Step 6b.
3. You will receive a Twilio OTP to your phone. Enter it to log in.
4. You should see the super admin dashboard.
5. Navigate to **Users** and verify the admin account is listed.
6. Navigate to **Surveys** — it will be empty until surveys are submitted.

!!! tip "Approving volunteer accounts"
    New volunteers who sign up will appear in the Users list with status **Pending**. As admin, you must approve them before they can complete surveys. This prevents unauthorized access.

---

## Step 8: Customize for your city

Before going to production, you will want to:

- **Edit the survey questions** — see [Configuration → Survey JSON](configuration.md#survey-json)
- **Update branding** — see [Configuration → Branding](configuration.md#branding)
- **Verify locations** — check that all sites are correctly imported
- **Set `NODE_ENV=production`** in your production environment

---

## Step 9: Deploy to production

See [Deployment](../how-to/deployment.md) for full instructions on deploying to Azure App Service (the setup used by King County) or adapting to another host.

---

## Step 10: Run a test campaign end-to-end

Before your live campaign:

1. Have one team member log in as a volunteer.
2. Scan one of the seed QR codes (from Step 6c).
3. Complete the survey as a test participant.
4. Verify the survey appears in the admin dashboard.
5. Check that 3 child QR codes were generated.
6. Scan a child QR code and complete a second survey.
7. Confirm the referral link is visible in the survey data (`parentSurveyCode`).

You are ready for your campaign. See [Experimental Setup](../how-to/experimental-setup.md) for the full pre-campaign checklist.
