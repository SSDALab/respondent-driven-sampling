# Project Overview

## History

The RDS App was developed through a collaboration between:

- **University of Washington iSchool** — Graduate students and faculty who designed and built the initial application.
- **King County Regional Homelessness Authority (KCRHA)** — The primary partner and end user, using the app to run Point-in-Time (PIT) count surveys of unsheltered individuals in King County, Washington.
- **UW eScience Institute / Scientific Software Engineering Center (SSEC)** — Provided software engineering support, code quality, and open-source infrastructure.

The first production deployment was used for the **2026 King County Unsheltered PIT Count**, collecting surveys from approximately 3,700 individuals experiencing unsheltered homelessness.

## What the app does

The RDS App enables **volunteer-led, QR code-based survey campaigns** for Respondent-Driven Sampling. Key capabilities:

| Capability | Description |
|---|---|
| **Volunteer survey collection** | Volunteers log in, scan a referral QR code, and guide participants through the survey |
| **Referral chain tracking** | Each completed survey generates 3 child QR codes; referral relationships are stored |
| **Admin oversight** | Admins can view, filter, and manage all survey entries in a dashboard |
| **User management** | Admins approve volunteer accounts; roles (volunteer, admin, super-admin) control access |
| **SMS gift card distribution** | (Optional) Bulk SMS to survey participants with gift card information via Twilio |
| **Coupon / seed generation** | CLI scripts print QR code PDFs for distribution at outreach sites |

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Material-UI, Vite |
| Backend | Node.js, Express.js, TypeScript |
| Database | MongoDB (via Mongoose) |
| Auth | Twilio Verify (OTP), JWT |
| Permissions | CASL (role + attribute-based) |
| Hosting | Azure App Service |
| QR Scanning | Html5QrcodeScanner, QRCodeCanvas |

## Open source and reuse

The app is released under the **BSD 3-Clause License** and is designed to be forkable and adaptable. The survey questionnaire, locations, and campaign-specific content are all configurable without code changes.

See [Configuration](../getting-started/configuration.md) for how to adapt the app for your locality.

## Contributors

Thanks to the following people who built this project:

Ihsan Kahveci, June Yang, Emily Porter, Zack Almquist, Elizabeth Deng, KelliAnn Ramirez, Jasmine Vuong, Hannah Lam, Ella Weinberg, Arushi Agarwal, Devanshi Desai, Aryan Palave, Kaden Kapadia, Hrudhai Umashankar, Liya Finley Hutchison, Hana Amos, Zack Crouse, Kristen L Gustafson, Anshul Tambay.

## License and citation

- **License:** BSD 3-Clause — see [LICENSE](https://github.com/uw-ssec/respondent-driven-sampling/blob/main/LICENSE) on GitHub.
- **Citation:** A `CITATION.cff` file is available in the repo root for citing this software in academic work.
