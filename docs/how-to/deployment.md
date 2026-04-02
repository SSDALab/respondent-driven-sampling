# Deployment

This page covers deploying the RDS App to Azure App Service, the hosting platform used by King County. Complete the [Getting Started](../getting-started/getting-started.md) guide before proceeding.

!!! tip "Need to provision Azure resources first?"
    If the Azure Resource Group, MongoDB cluster, App Service Plan, and Web App do not exist yet, see [Infrastructure](infrastructure.md) to provision them with Pulumi before deploying application code.

The app is a monorepo: the React frontend (`client/`) is built to static files, copied into the `server/` folder, and served by the Express backend as a single Node.js service.

## Deployment via GitHub Actions (recommended)

A GitHub Actions workflow automates the build-and-deploy process on every push to a designated branch. The workflow:

1. Checks out the repository
2. Builds the React client (`cd client && npm run build`)
3. Copies `client/dist/` into `server/dist/`
4. Installs server dependencies
5. Deploys the `server/` folder to Azure App Service

Reference workflow files are included in the repository at `.github/workflows/azure-webapp-deploy-*.yml`. See [CI / Workflows](ci.md#deployment-workflows-king-county-specific) for details on these files and how to adapt them for a new city.

### Azure Credentials Setup

1. In the Azure Portal, navigate to the App Service and select **Download publish profile**.
2. In the GitHub repository, navigate to **Settings > Secrets and variables > Actions > New repository secret**.
3. Create a secret named `AZURE_PUBLISH_PROFILE` and paste the contents of the downloaded publish profile XML.
4. In the workflow YAML, set `app-name` to the Azure App Service name.

### Triggering a Deployment

Pushing to `kc-pit-2026` triggers the production deployment. Pushing to `kc-pit-2026-test` triggers the test slot deployment. See [CI / Workflows](ci.md) for the full workflow details.

---

## Manual Deployment via VS Code

For testing a deployment without pushing to the main branch, the Azure App Service VS Code extension provides a manual deploy workflow.

### Prerequisites

1. Install the **Azure App Service** extension in VS Code.
2. Sign in to an Azure account with an active subscription via the Azure tab in the sidebar.

### Creating an App Service (if needed)

1. In the Azure tab, right-click **App Services** and select "Create New Web App."
2. Select region (e.g. "West US"), provide a name, select **Node 22 LTS** as the runtime, and choose a pricing tier.

### Deploying

1. Delete `server/node_modules/` to reduce upload size (dependencies are reinstalled on the server).
2. Build the client and copy the output into the server folder:

```bash
cd client && npm run build
cp -r client/dist server/dist
```

3. In the Azure tab, right-click the target App Service and select **Deploy to Web App**. The deployment target directory is configured in `.vscode/settings.json`.
4. Once deployment completes, a pop-up in VS Code provides a link to the live app. The URL is also available in the Azure Portal under the App Service overview.

---

## Environment Variables in Production

On Azure App Service, environment variables are set as **Application settings** (not in a `.env` file).

If the infrastructure was provisioned with Pulumi (see [Infrastructure](infrastructure.md)), these settings are configured automatically during `pulumi up`. Otherwise, set them manually:

Azure Portal > App Service > **Configuration** > **Application settings** > add each variable as a key-value pair > Save > restart the service.

See [Environment Variables](../reference/environment-variables.md) for the full list of required variables.
