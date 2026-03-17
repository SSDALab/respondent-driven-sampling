<!-- Zenodo DOI badge — replace TODO_ZENODO_DOI with actual DOI after Zenodo registration -->
[![DOI](https://zenodo.org/badge/DOI/TODO_ZENODO_DOI.svg)](https://doi.org/TODO_ZENODO_DOI)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)

## Overview

> **Documentation:** [uw-ssec.github.io/respondent-driven-sampling](https://uw-ssec.github.io/respondent-driven-sampling/)

The RDS App is an open-source web application for conducting **Respondent-Driven Sampling (RDS)** surveys of unsheltered populations. Developed in collaboration with the University of Washington  County Regional Homelessness Authority (KCRHA), the app enables volunteers and administrators to collect survey data, track referral chains, and develop population estimates for Point-in-Time (PIT) counts.

The codebase is a TypeScript monorepo: React frontend (`client/`), Node.js/Express backend (`server/`), and MongoDB for data storage. Authentication is handled via Twilio Verify (OTP). The present deployment is through Azure App Service.

## Setup Instructions

### Local Development

1. **Clone the repo**

```bash
git clone https://github.com/uw-ssec/respondent-driven-sampling.git
cd respondent-driven-sampling
```

1. **Set environment variables**
  Copy `server/.env.example` to your local `server/.env` and fill in the required values (MongoDB, Twilio, etc.). See the [Environment Variables](https://uw-ssec.github.io/respondent-driven-sampling/reference/environment-variables/) reference for details.
2. **Install packages**

```bash
cd client && npm install
cd ../server && npm install
```

1. **Start the backend server** (with hot reload)

```bash
cd server
npm run dev
```

   For production-style run: `npm run build` then `npm start`.

1. **Start the frontend dev server** (in a separate terminal)

```bash
cd client
npm run dev
```

1. **Visit the app** at [http://localhost:3000](http://localhost:3000).

The login page will load, but authentication requires the database to be initialised with locations, a super admin account, and seeds. See [Getting Started](https://uw-ssec.github.io/respondent-driven-sampling/getting-started/getting-started/) for the full setup walkthrough.

## Future Directions

The following features have been identified as high-priority candidates for future development:

**App Features**

- Auto-populate location using GPS coordinates
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

## Contributors
[![Contributors](https://contrib.rocks/image?repo=uw-ssec/respondent-driven-sampling)](https://github.com/uw-ssec/respondent-driven-sampling/graphs/contributors)
