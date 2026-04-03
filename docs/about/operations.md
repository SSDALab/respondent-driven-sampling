# Operations

This page covers infrastructure and access management for maintainers of the King County deployment. Other cities deploying their own instance will have their own equivalent infrastructure.

## Azure Access

The King County production and test deployments run on Azure App Service. Access to the Azure subscription is granted by UW team.

If you need access to:

- **Azure Portal** — open an issue in the repository or contact the SSEC team directly
- **Azure App Service logs** — Log stream is available in the Azure Portal under the App Service → **Log stream**
- **Production database (MongoDB Atlas)** — contact the UW SSEC team directly; access is restricted

## GitHub Organization Permissions

The repository lives under the [SSDALab](https://github.com/SSDALab) GitHub organization. Repository permissions are managed by org admins.

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

For questions, open an issue at [github.com/SSDALab/respondent-driven-sampling/issues](https://github.com/SSDALab/respondent-driven-sampling/issues).

## Zenodo Setup

### First-Time Setup (One-Time, Human-Required)

Zenodo registration cannot be automated — it requires a repository maintainer with admin access to perform the following steps once:

1. Go to [zenodo.org](https://zenodo.org) and sign in with GitHub.
2. Navigate to **Account → Settings → GitHub**.
3. Find `SSDALab/respondent-driven-sampling` in the repository list and toggle it **On**.
4. Publish a GitHub Release (tag: `v1.0.0` or appropriate).
5. Zenodo archives the release and issues a DOI within 1–2 minutes.
6. Copy the concept DOI (stable across all versions) from the Zenodo record page.
7. Update `CITATION.cff` with `doi: 10.5281/zenodo.XXXXXXX`, `version`, and `date-released`.
8. Update `README.md` with the real DOI.
10. Commit and push these updates to `main`.

After first-time setup, future GitHub Releases are archived automatically.

### Per-Release Verification

After publishing each subsequent GitHub Release:

1. Wait 1–2 minutes.
2. Check [zenodo.org/account/settings/github](https://zenodo.org/account/settings/github) to confirm the release was archived.
3. Update `CITATION.cff` with the new `version` and `date-released`.
4. Commit the update directly to `main`.

