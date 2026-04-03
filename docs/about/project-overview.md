# Project Overview

## History

The RDS App was developed through a collaboration between:

- **University of Washington, Department of Sociology** — Zack Almquist, June Yang, and Ihsan Kahveci; primary academic home of the project.
- **University of Washington, Information School (iSchool)** — Emily Porter and capstone students who contributed to the application.
- **King County Regional Homelessness Authority (KCRHA)** — The primary partner and end user, using the app to run Point-in-Time (PIT) count surveys of unsheltered individuals in King County, Washington.
- **UW eScience Institute / Scientific Software Engineering Center (SSEC)** — Provided software engineering support, code quality, and open-source infrastructure.

The first production deployment was used for the **2026 King County Unsheltered PIT Count**, collecting surveys from approximately 2,183 individuals experiencing unsheltered homelessness.

## What the App Does

The RDS App streamlines the implementation of respondent-driven sampling (RDS) for unsheltered point-in-time counts of people experiencing homelessness. The details of this method are described [here](https://academic.oup.com/aje/article/194/6/1524/7749332?login=true).

Key capabilities:

| Capability | Description |
|---|---|
| **Volunteer survey collection** | Volunteers log in, scan a referral QR code from a participant, then guide participants through the survey |
| **Referral chain tracking** | Each completed survey generates 3 child QR codes; referral relationships are stored in the database |
| **Admin oversight** | Admins can view, filter, and manage all survey entries in a dashboard |
| **User management** | Admins approve volunteer accounts; roles (volunteer, manager, admin, super-admin) control access |
| **SMS gift card distribution** | (Optional) Bulk SMS to survey participants with gift card information via Twilio |
| **Coupon / seed generation** | CLI scripts print QR code PDFs for distribution at outreach sites |

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Material-UI, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB (via Mongoose) |
| Auth | Twilio Verify (OTP), JWT |
| Permissions | CASL (role + attribute-based) |
| Hosting | Azure App Service |
| Infrastructure | Pulumi (TypeScript), Azure |
| QR Scanning | Html5QrcodeScanner, QRCodeCanvas |

## Open Source and Reuse

The app is released under the **BSD 3-Clause License** (see [License](license.md)) and is designed to be forkable and adaptable. The survey questionnaire, locations, and campaign-specific content are all configurable without code changes.

See [Getting Started](../getting-started/getting-started.md#7-customise) for how to adapt the app for a new locality.
