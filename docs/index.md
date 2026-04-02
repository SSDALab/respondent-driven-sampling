# RDS App Documentation

The **RDS App** is an open-source web application for conducting Respondent-Driven Sampling (RDS) surveys of unsheltered populations. Developed in partnership with the University of Washington Department of Sociology and Information School (iSchool), and the King County Regional Homelessness Authority (KCRHA), the application is designed for reuse by other cities and localities.

The codebase is a TypeScript monorepo (React frontend, Node.js/Express backend, MongoDB) requiring a developer familiar with Node.js, a MongoDB instance, and a Twilio account for OTP authentication. Deployment targets Azure App Service, though any Node.js host is compatible.

- [Getting Started](getting-started/getting-started.md) — prerequisites, setup, and deployment
- [How-To Guides](how-to/deployment.md) — deployment, debugging, experimental setup, and operations
- [Reference](reference/architecture.md) — architecture, environment variables, CLI scripts, and API

## Project Status

The RDS App was used in the **2026 King County Unsheltered Point-in-Time Count** to collect surveys from approximately 2,183 unsheltered individuals. The codebase is actively maintained and open to community contributions.

## Relevant Links

- **License:** BSD 3-Clause — see [License](about/license.md)
- **Contributing:** [CONTRIBUTING.md](https://github.com/SSDALab/respondent-driven-sampling/blob/main/CONTRIBUTING.md)
- **Repository:** [github.com/SSDALab/respondent-driven-sampling](https://github.com/SSDALab/respondent-driven-sampling)
- **Issues:** [GitHub Issues](https://github.com/SSDALab/respondent-driven-sampling/issues)

