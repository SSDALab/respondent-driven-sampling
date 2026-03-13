# Prerequisites

Before you can deploy the RDS App for your city, you will need the following accounts and tools. Most have free tiers adequate for a single PIT count campaign.

## Accounts

### GitHub

You will need a GitHub account to fork the repository and use GitHub Actions for CI/CD.

- [Create a GitHub account](https://github.com/join) (free)
- [Fork the repo](https://github.com/uw-ssec/respondent-driven-sampling/fork)

### MongoDB

The app stores all survey data, user accounts, seeds, and locations in MongoDB. The easiest option for a new city is **MongoDB Atlas** (fully managed, free tier available).

- [Create a MongoDB Atlas account](https://www.mongodb.com/cloud/atlas/register) (free tier: M0, 512 MB storage — adequate for a city-scale PIT count)
- Alternative: **Azure Cosmos DB for MongoDB API** if your city already uses Azure infrastructure

You will need your MongoDB connection string (`MONGO_URI`) and database name (`MONGO_DB_NAME`) from this account.

### Twilio

The app uses Twilio Verify for phone-number-based OTP authentication. This is how volunteers log in.

- [Create a Twilio account](https://www.twilio.com/try-twilio) (free trial includes test credits)
- After signing up, create a **Verify service** in the Twilio Console
- You will need: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_VERIFY_SID` (starts with `VA`)

!!! note "SMS optional"
    The `TWILIO_PHONE_NUMBER` variable is only needed if you plan to send bulk SMS to survey participants (gift card notifications). Basic OTP auth for volunteers works without it.

### Azure (or other Node.js host)

The app is deployed as a Node.js web service. King County uses **Azure App Service**.

- [Create an Azure account](https://azure.microsoft.com/en-us/free/) (free tier available for testing)
- Alternatively, deploy to any Node.js hosting platform (Railway, Render, Fly.io, etc.) — see [Deployment](../how-to/deployment.md) for Azure-specific instructions and notes on adapting to other hosts

## Local development tools

| Tool | Version | Purpose |
|---|---|---|
| Node.js | 22.x | Run the app locally |
| npm | bundled with Node | Install dependencies and run scripts |
| Git | any recent | Clone and manage your fork |
| Python 3.x | 3.9+ | Build and preview the documentation site |

Install Node.js from [nodejs.org](https://nodejs.org/) (use the LTS version or `nvm` to manage multiple versions).

## Survey content

Before you start configuration, it helps to have a rough idea of the survey you want to run:

- What questions do you want to ask? (The existing survey targets unsheltered homelessness; you may adapt it)
- What are the names and addresses of your survey sites (locations)?
- How many seeds (initial QR codes) do you need per site?
- What is the gift card amount / incentive structure?

You do not need final answers yet — the app is configurable after setup — but having this information ready will make the [Configuration](configuration.md) step much faster.
