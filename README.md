## Overview

> **Documentation:** [uw-ssec.github.io/respondent-driven-sampling](https://uw-ssec.github.io/respondent-driven-sampling/)

The RDS App is a secure, accessible, and open-source web application that streamlines data collection for homelessness research using **Respondent-Driven Sampling (RDS)**. Developed in collaboration with the University of Washington iSchool and the King County Regional Homelessness Authority (KCRHA), this app enables volunteers and administrators to collect accurate survey data, track referrals, and generate population estimates more effectively than traditional Point-In-Time (PIT) counts.

<!-- > **Live Deployment:** [Link to App](https://rds-main-g6e3dpefdabmcmca.westus-01.azurewebsites.net/login) -->

> **Research-Driven:** Based on field-tested RDS methodologies

> **Secure & Compliant:** Built with HIPAA and HUD compliance in mind

## Tech Stack

| Layer       | Technology                       |
| ----------- | -------------------------------- |
| Frontend    | React, HTML/CSS, JavaScript      |
| Backend     | Node.js, Express.js              |
| Database    | MongoDB                          |
| Auth        | Twilio                           |
| Hosting     | Azure Web Service                |
| QR Scanning | Html5QrcodeScanner, QRCodeCanvas |

## Directory structure

```plaintext
client/                   # Client-facing React application (Vite)
├── dist/                 # Production build output (Vite)
├── public/               # Static assets (favicon, index.html, manifest, robots.txt)
├── src/
│   ├── components/      # Reusable UI (Header, ProtectedRoute, forms)
│   ├── pages/           # Route-level pages (Login, Survey, StaffDashboard, etc.)
│   ├── hooks/           # Custom hooks (useAuth, useApi, useAbility)
│   ├── stores/          # Zustand stores (auth, survey)
│   ├── contexts/        # React context (AuthProvider)
│   ├── types/           # TypeScript types
│   ├── theme/            # MUI theme
│   ├── App.tsx
│   ├── index.tsx
│   └── ...
├── package.json
├── vite.config.ts
└── tsconfig.json
server/                   # Backend (Node.js, Express, TypeScript)
├── src/
│   ├── index.ts          # Main entry point
│   ├── routes/           # API routes (auth.ts, surveys.ts, users.ts, locations.ts, seeds.ts)
│   ├── database/        # Domain modules (survey, user, seed, location) with mongoose + zod
│   ├── middleware/      # Auth, validation
│   ├── permissions/     # CASL ability builder and utils
│   ├── scripts/         # CLI scripts (superAdminCRUD, locationCRUD, generateSeeds, generateCoupons)
│   ├── config/          # Swagger, etc.
│   ├── utils/
│   └── types/
├── build/                # Compiled output (tsc)
├── package.json
└── .env.example          # Copy to .env with your values
```

See the [docs/](docs/) folder for deployment, database migration, and more.

## Setup Instructions

### 🔧 Local Development

1. **Clone the repo**

```bash
git clone <repository>
cd <repository>
```

2. **Set environment variables**
   Copy `server/.env.example` to `server/.env` in the server directory and fill in the necessary environment values (MongoDB, Twilio, etc.).

3. **Install packages**
   Install dependencies for both client and server:

```bash
cd client && npm install
cd ../server && npm install
```

4. **Start the backend server**
   For local development (with hot reload):

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

6. **Visit the app** at http://localhost:3000.

## Future Directions

The items listed below are features our team has identified out of scope for the duration of our project. These items are still considered high importance for the project as a whole, and are highly recommended as a jumping off point for teams taking over the project in the future.

**App Features**

-   Auto-populate location using GPS location coordinates
-   Widget for staff to comment on survey responses
-   Integration with Homeless Management Information System (HMIS) database system
-   Volunteer scheduling dashboard for administrators
-   Automated SMS gift card distribution
-   Resume unfinished survey feature
-   Admin ability to edit survey questions
-   Volunteer ability to edit survey responses
-   Survey analytics dashboard

**Testing**

-   Dynamic Application Security Testing (DAST)

**User Experience**
-Step-by-step user training guide

-   Setup wizard

## Contributors

Thanks to the following people for their work on this project: Ihsan Kahveci, June Yang, Emily Porter, Zack Almquist, Elizabeth Deng, KelliAnn Ramirez, Jasmine Vuong, Hannah Lam, Ella Weinberg, Arushi Agarwal, Devanshi Desai, Aryan Palave, Kaden Kapadia, Hrudhai Umashankar, Liya Finley Hutchison, Hana Amos, Zack Crouse, Kristen L Gustafson.
