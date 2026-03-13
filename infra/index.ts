import * as pulumi from "@pulumi/pulumi";
import * as resources from "@pulumi/azure-native/resources";
import * as documentdb from "@pulumi/azure-native/documentdb";
import * as web from "@pulumi/azure-native/web";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
const config = new pulumi.Config();

// Required
const resourceGroupName = config.require("resourceGroupName");
const location = config.require("location");
const cosmosDbAccountName = config.require("cosmosDbAccountName");
const cosmosDbDatabaseName = config.require("cosmosDbDatabaseName");
const appServicePlanName = config.require("appServicePlanName");
const webAppName = config.require("webAppName");
const nodeVersion = config.require("nodeVersion");
const skuName = config.require("skuName");

// Secrets
const twilioAccountSid = config.requireSecret("twilioAccountSid");
const twilioAuthToken = config.requireSecret("twilioAuthToken");
const twilioVerifySid = config.requireSecret("twilioVerifySid");

// Optional with defaults
const cosmosDbConsistencyLevel =
  (config.get("cosmosDbConsistencyLevel") ?? "Session") as documentdb.DefaultConsistencyLevel;
const cosmosDbOfferType =
  (config.get("cosmosDbOfferType") ?? "Standard") as "Standard";
const nodeEnv = config.get("nodeEnv") ?? "production";

// ---------------------------------------------------------------------------
// Resource Group
// ---------------------------------------------------------------------------
const resourceGroup = new resources.ResourceGroup("rds-resource-group", {
  resourceGroupName: resourceGroupName,
  location: location,
});

// ---------------------------------------------------------------------------
// Cosmos DB Account (MongoDB API)
// ---------------------------------------------------------------------------
const cosmosDbAccount = new documentdb.DatabaseAccount("rds-cosmos-db", {
  accountName: cosmosDbAccountName,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  kind: "MongoDB",
  databaseAccountOfferType: cosmosDbOfferType,
  capabilities: [{ name: "EnableMongo" }],
  consistencyPolicy: {
    defaultConsistencyLevel: cosmosDbConsistencyLevel,
  },
  locations: [
    {
      locationName: resourceGroup.location,
      failoverPriority: 0,
    },
  ],
});

// ---------------------------------------------------------------------------
// Cosmos DB MongoDB Database
// ---------------------------------------------------------------------------
const mongoDb = new documentdb.MongoDBResourceMongoDBDatabase("rds-mongo-db", {
  databaseName: cosmosDbDatabaseName,
  accountName: cosmosDbAccount.name,
  resourceGroupName: resourceGroup.name,
  resource: {
    id: cosmosDbDatabaseName,
  },
});

// ---------------------------------------------------------------------------
// Cosmos DB Connection String
// ---------------------------------------------------------------------------
const connectionStrings = pulumi.all([resourceGroup.name, cosmosDbAccount.name]).apply(
  ([rgName, accountName]) =>
    documentdb.listDatabaseAccountConnectionStringsOutput({
      resourceGroupName: rgName,
      accountName: accountName,
    }),
);

const mongoUri = connectionStrings.apply((cs) => {
  const primary = cs.connectionStrings?.[0]?.connectionString;
  if (!primary) {
    throw new Error("Could not retrieve Cosmos DB connection string");
  }
  return primary;
});

// ---------------------------------------------------------------------------
// App Service Plan (Linux)
// ---------------------------------------------------------------------------
const appServicePlan = new web.AppServicePlan("rds-service-plan", {
  name: appServicePlanName,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  kind: "Linux",
  reserved: true, // Required for Linux plans
  sku: {
    name: skuName,
  },
});

// ---------------------------------------------------------------------------
// Web App (Node.js on Linux)
// ---------------------------------------------------------------------------
const webApp = new web.WebApp("rds-web-app", {
  name: webAppName,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  serverFarmId: appServicePlan.id,
  siteConfig: {
    linuxFxVersion: `NODE|${nodeVersion}`,
    alwaysOn: true,
    appSettings: [
      { name: "WEBSITE_NODE_DEFAULT_VERSION", value: nodeVersion },
      { name: "NODE_ENV", value: nodeEnv },
      { name: "PORT", value: "8080" },
      { name: "SCM_DO_BUILD_DURING_DEPLOYMENT", value: "true" },
      { name: "MONGO_URI", value: mongoUri },
      { name: "TWILIO_ACCOUNT_SID", value: twilioAccountSid },
      { name: "TWILIO_AUTH_TOKEN", value: twilioAuthToken },
      { name: "TWILIO_VERIFY_SID", value: twilioVerifySid },
    ],
  },
});

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------
export const appServiceUrl = pulumi.interpolate`https://${webApp.defaultHostName}`;
export const cosmosDbConnectionString = mongoUri;
