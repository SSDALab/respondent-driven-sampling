<!-- Zenodo DOI badge — replace TODO_ZENODO_DOI with actual DOI after Zenodo registration -->
[![ssec](https://img.shields.io/badge/SSEC-Project-purple?logo=data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAOCAQAAABedl5ZAAAACXBIWXMAAAHKAAABygHMtnUxAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAMNJREFUGBltwcEqwwEcAOAfc1F2sNsOTqSlNUopSv5jW1YzHHYY/6YtLa1Jy4mbl3Bz8QIeyKM4fMaUxr4vZnEpjWnmLMSYCysxTcddhF25+EvJia5hhCudULAePyRalvUteXIfBgYxJufRuaKuprKsbDjVUrUj40FNQ11PTzEmrCmrevPhRcVQai8m1PRVvOPZgX2JttWYsGhD3atbHWcyUqX4oqDtJkJiJHUYv+R1JbaNHJmP/+Q1HLu2GbNoSm3Ft0+Y1YMdPSTSwQAAAABJRU5ErkJggg==&style=plastic)](https://escience.washington.edu/software-engineering/ssec/)
[![DOI](https://zenodo.org/badge/DOI/TODO_ZENODO_DOI.svg)](https://doi.org/TODO_ZENODO_DOI)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

## Overview

> **Documentation:** [ssdlab.github.io/respondent-driven-sampling](https://ssdlab.github.io/respondent-driven-sampling/)

The RDS App is an open-source web application for conducting **Respondent-Driven Sampling (RDS)** surveys of unsheltered populations. Developed in collaboration with the University of Washington  County Regional Homelessness Authority (KCRHA), the app enables volunteers and administrators to collect survey data, track referral chains, and develop population estimates for Point-in-Time (PIT) counts.

The codebase is a TypeScript monorepo: React frontend (`client/`), Node.js/Express backend (`server/`), and MongoDB for data storage. Authentication is handled via Twilio Verify (OTP). The present deployment is through Azure App Service.

## Local Development

1. **Clone the repo**

```bash
git clone https://github.com/SSDALab/respondent-driven-sampling.git
cd respondent-driven-sampling
```

2. **Set environment variables**

   Copy the template to create your local env file:

   ```bash
   cp server/.env.example server/.env
   ```

   Open `server/.env` and fill in your values:

   ```dotenv
   NODE_ENV=development
   MONGO_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/
   MONGO_DB_NAME=rds-your-db-name
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_VERIFY_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_PHONE_NUMBER=+12065551234
   AUTH_SECRET=paste_output_of_openssl_rand_-hex_32
   TIMEZONE=America/Los_Angeles
   ```

   > **Where do I get these values?**
   > These credentials are **not** included in the repository. Contact a project maintainer to obtain shared development values, or set up your own [MongoDB Atlas](https://www.mongodb.com/atlas) and [Twilio](https://console.twilio.com) accounts. Generate `AUTH_SECRET` locally with `openssl rand -hex 32`. See the full [Environment Variables](https://ssdlab.github.io/respondent-driven-sampling/reference/environment-variables/) reference for details on each variable.

   **Important:** The file must be `server/.env` (next to `server/package.json`), not inside `server/src/` or the repository root.

3. **Install packages**

```bash
cd client && npm install
cd ../server && npm install
```

4. **Start the backend server** (with hot reload)

```bash
cd server
npm run dev
```

   For production-style run: `npm run build` then `npm start`.

5. **Start the frontend dev server** (in a separate terminal)

```bash
cd client
npm run dev
```

6. **Visit the app** at [http://localhost:3000](http://localhost:3000).

The login page will load, but authentication requires the database to be initialised with locations, a super admin account, and seeds. See [Getting Started](https://ssdlab.github.io/respondent-driven-sampling/getting-started/getting-started/) for the full setup walkthrough.

## Future Directions

The following features have been identified as high-priority candidates for future development:

**App Features**

- Auto-populate location from last survey entry
- Widget for staff to comment on survey responses
- Integration with Homeless Management Information System (HMIS)
- Volunteer scheduling dashboard for administrators
- Resume unfinished survey feature
- Admin ability to edit survey questions
- Volunteer ability to edit survey responses
- Survey analytics dashboard

**Testing**

- Dynamic Application Security Testing (DAST)

## Funding Support

This project is supported by:

- NSF CAREER Grant [#SES-2142964](https://www.nsf.gov/awardsearch/showAward?AWD_ID=2142964) to Zack Almquist (PI)
- UW Population Health Grant Tier 3

## Citation

If you use this software, please cite it via the **"Cite this repository"** button on GitHub or see [`CITATION.cff`](CITATION.cff).

## Funding Support
- This project is supported by 
    - NSF CAREER GRANT #SES-2142964 to Zack Almquist (PI)
    - UW Population Health Grant Tier 3
  
## Contributors
[![Contributors](https://contrib.rocks/image?repo=SSDALab/respondent-driven-sampling)](https://github.com/SSDALab/respondent-driven-sampling/graphs/contributors)
