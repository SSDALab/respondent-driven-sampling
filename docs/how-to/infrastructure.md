# Infrastructure Provisioning

The `infra/` directory contains a [Pulumi](https://www.pulumi.com/) project (TypeScript) that provisions all Azure resources required to run the RDS App. No Pulumi Cloud account is required — state is stored locally.

## What Gets Created

Running `pulumi up` provisions four Azure resources:

| Resource | Purpose |
|---|---|
| **Resource Group** | Logical container for all RDS resources |
| **MongoDB vCore Cluster** (Cosmos DB) | Application database |
| **App Service Plan** (Linux) | Compute plan for the web app |
| **Web App** (Node.js on Linux) | Hosts the Express server and React frontend |

Pulumi also configures the Web App's **Application settings** (environment variables) automatically, including `MONGO_URI`, `AUTH_SECRET`, and the Twilio credentials. See [Environment Variables](../reference/environment-variables.md) for the meaning of each variable.

## Prerequisites

- [Node.js](https://nodejs.org/) (>=20.17.0)
- [Pulumi CLI](https://www.pulumi.com/docs/install/)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- An Azure subscription

## Quick Start

From the repository root:

```bash
# 1. Install dependencies
cd infra
npm install

# 2. Log in to Azure
az login

# 3. Use local Pulumi state (no account needed)
pulumi login --local

# 4. Create a stack
pulumi stack init prod

# 5. Set required config
pulumi config set location westus2
pulumi config set resourceGroupName my-rds-rg
pulumi config set mongoClusterName my-rds-db
pulumi config set mongoDbName main
pulumi config set appServicePlanName my-rds-plan
pulumi config set webAppName my-rds-app
pulumi config set skuName B1

# 6. Set secrets
pulumi config set --secret mongoAdminLogin <your-admin-user>
pulumi config set --secret mongoAdminPassword <your-admin-password>
pulumi config set --secret authSecret <your-auth-secret>
pulumi config set --secret twilioAccountSid <your-sid>
pulumi config set --secret twilioAuthToken <your-token>
pulumi config set --secret twilioVerifySid <your-verify-sid>

# 7. Deploy
pulumi up
```

!!! warning "Secrets"
    `mongoAdminPassword`, `authSecret`, and the Twilio credentials contain sensitive values. Always use `pulumi config set --secret` so they are encrypted in the stack state file.

## Config Reference

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `resourceGroupName` | Yes | — | Azure Resource Group name |
| `location` | Yes | — | Azure region (e.g. `westus2`) |
| `mongoClusterName` | Yes | — | MongoDB vCore cluster name |
| `mongoDbName` | Yes | — | MongoDB database name (e.g. `main`) |
| `appServicePlanName` | Yes | — | App Service Plan name |
| `webAppName` | Yes | — | Web App name (globally unique) |
| `skuName` | Yes | — | App Service Plan SKU (e.g. `B1`, `P1v2`) |
| `mongoAdminLogin` | Yes (secret) | — | MongoDB admin username |
| `mongoAdminPassword` | Yes (secret) | — | MongoDB admin password |
| `authSecret` | Yes (secret) | — | Auth secret for JWT signing |
| `twilioAccountSid` | Yes (secret) | — | Twilio Account SID |
| `twilioAuthToken` | Yes (secret) | — | Twilio Auth Token |
| `twilioVerifySid` | Yes (secret) | — | Twilio Verify Service SID |
| `nodeVersion` | No | `22-lts` | Node.js version for App Service |
| `nodeEnv` | No | `production` | `NODE_ENV` value |
| `mongoServerVersion` | No | `8.0` | MongoDB server version |
| `mongoSku` | No | `M20` | MongoDB vCore cluster SKU |
| `mongoDiskSizeGb` | No | `128` | MongoDB disk size in GB |

!!! note "App settings managed by Pulumi"
    When infrastructure is provisioned with Pulumi, the Web App's Application settings (`MONGO_URI`, `MONGO_DB_NAME`, `AUTH_SECRET`, Twilio credentials, etc.) are set automatically. There is no need to configure them manually in the Azure Portal.

## Importing Existing Resources

If Azure resources already exist (e.g. from a previous Terraform setup), they can be imported instead of recreated:

1. Find each resource's Azure ID (from the Azure Portal or `az` CLI).
2. Add `{ import: "<azure-resource-id>" }` as the third argument to each Pulumi resource constructor in `index.ts`.
3. Run `pulumi up` — Pulumi adopts the resources without modifying them.
4. Remove the `import` options and run `pulumi up` again to verify no changes are detected.

Import order: Resource Group → MongoDB Cluster → App Service Plan → Web App.

## Tear Down

```bash
pulumi destroy
pulumi stack rm prod
```

## Troubleshooting

- **`az login` errors** — Verify `az account show` returns a valid subscription. Set the `ARM_SUBSCRIPTION_ID` environment variable if needed.
- **Name conflicts** — `mongoClusterName` and `webAppName` must be globally unique across Azure.
- **SKU not available** — Some SKUs are region-specific. Try `B1` or `P1v2` in the chosen region.
- **Node version format** — Use `22-lts` (not `v22` or `22.x`). This maps to `NODE|22-lts` in the App Service config.

---

After provisioning, proceed to [Deployment](deployment.md) to push the application code to the new Azure App Service.
