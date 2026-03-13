# RDS Infrastructure (Pulumi + Azure)

Deploy the full Azure stack for the Respondent-Driven Sampling app using **Pulumi with TypeScript**.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Pulumi CLI](https://www.pulumi.com/docs/install/)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- An Azure subscription

## Quick Start

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
pulumi config set location eastus
pulumi config set resourceGroupName my-rds-rg
pulumi config set cosmosDbAccountName my-rds-cosmos
pulumi config set cosmosDbDatabaseName my-rds-db
pulumi config set appServicePlanName my-rds-plan
pulumi config set webAppName my-rds-app
pulumi config set nodeVersion "22-lts"
pulumi config set skuName B1

# 6. Set secrets
pulumi config set --secret twilioAccountSid <your-sid>
pulumi config set --secret twilioAuthToken <your-token>
pulumi config set --secret twilioVerifySid <your-verify-sid>

# 7. Deploy
pulumi up
```

## Config Reference

| Key | Required | Default | Description |
|-----|----------|---------|-------------|
| `resourceGroupName` | Yes | — | Azure Resource Group name |
| `location` | Yes | — | Azure region (e.g. `eastus`) |
| `cosmosDbAccountName` | Yes | — | Cosmos DB account name (globally unique) |
| `cosmosDbDatabaseName` | Yes | — | MongoDB database name |
| `appServicePlanName` | Yes | — | App Service Plan name |
| `webAppName` | Yes | — | Web App name (globally unique) |
| `nodeVersion` | Yes | — | Node.js version (e.g. `22-lts`) |
| `skuName` | Yes | — | App Service Plan SKU (e.g. `B1`, `P1v2`) |
| `twilioAccountSid` | Yes (secret) | — | Twilio Account SID |
| `twilioAuthToken` | Yes (secret) | — | Twilio Auth Token |
| `twilioVerifySid` | Yes (secret) | — | Twilio Verify Service SID |
| `cosmosDbConsistencyLevel` | No | `Session` | Cosmos DB consistency level |
| `cosmosDbOfferType` | No | `Standard` | Cosmos DB offer type |
| `nodeEnv` | No | `production` | `NODE_ENV` value |

## Importing Existing Resources

If you already have Azure resources deployed (e.g. from the old Terraform setup), you can import them instead of creating new ones:

1. Find each resource's Azure ID (from the Azure Portal or `az` CLI)
2. Add `{ import: "<azure-resource-id>" }` as the third argument to each Pulumi resource constructor in `index.ts`
3. Run `pulumi up` — Pulumi adopts the resources without modifying them
4. Remove the `import` options and run `pulumi up` again to verify no changes

Import order: Resource Group → Cosmos DB Account → Cosmos DB Database → App Service Plan → Web App

## Tear Down

```bash
pulumi destroy
pulumi stack rm prod
```

## Troubleshooting

- **"az login" errors**: Make sure `az account show` returns a valid subscription. Set `ARM_SUBSCRIPTION_ID` env var if needed.
- **Name conflicts**: `cosmosDbAccountName` and `webAppName` must be globally unique across Azure.
- **SKU not available**: Some SKUs are region-specific. Try `B1` or `P1v2` in your chosen region.
- **Node version format**: Use `22-lts` (not `v22` or `22.x`). This maps to `NODE|22-lts` in the App Service config.
