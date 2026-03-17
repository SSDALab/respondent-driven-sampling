# Operations

This page covers infrastructure and access management for maintainers of the King County deployment. Other cities deploying their own instance will have their own equivalent infrastructure.

## Azure Access

The King County production and test deployments run on Azure App Service. Access to the Azure subscription is granted by UW team.

If you need access to:

- **Azure Portal** — open an issue in the repository or contact the SSEC team directly
- **Azure App Service logs** — Log stream is available in the Azure Portal under the App Service → **Log stream**
- **Production database (MongoDB Atlas)** — contact the UW SSEC team directly; access is restricted

## GitHub Organization Permissions

The repository currently lives under the [uw-ssec](https://github.com/uw-ssec) GitHub organization. Repository permissions are managed by SSEC org admins.

To request:

- **Write access to the repo** — open an issue
- **GitHub Actions secrets** (e.g. `AZURE_PUBLISH_PROFILE`) — requires admin access; request via an issue

## Monitoring

The production app does not currently have a dedicated monitoring service. To check on the app:

- **Azure Portal → App Service → Log stream** — real-time Node.js server logs
- **Azure Portal → App Service → Metrics** — CPU, memory, request count
- **MongoDB Atlas → Monitoring** — database query performance and connections

## For Other Cities

If you are running your own deployment, you are responsible for your own infrastructure. UW can provide guidance but does not manage other cities' Azure or MongoDB accounts.

For questions, open an issue at [github.com/uw-ssec/respondent-driven-sampling/issues](https://github.com/uw-ssec/respondent-driven-sampling/issues).