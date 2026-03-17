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
const mongoClusterName = config.require("mongoClusterName");
const mongoDbName = config.require("mongoDbName");
const appServicePlanName = config.require("appServicePlanName");
const webAppName = config.require("webAppName");
const skuName = config.require("skuName");

// Secrets
const mongoAdminLogin = config.requireSecret("mongoAdminLogin");
const mongoAdminPassword = config.requireSecret("mongoAdminPassword");
const authSecret = config.requireSecret("authSecret");
const twilioAccountSid = config.requireSecret("twilioAccountSid");
const twilioAuthToken = config.requireSecret("twilioAuthToken");
const twilioVerifySid = config.requireSecret("twilioVerifySid");

// Optional with defaults
const nodeVersion = config.get("nodeVersion") ?? "22-lts";
const nodeEnv = config.get("nodeEnv") ?? "production";
const mongoServerVersion = config.get("mongoServerVersion") ?? "8.0";
const mongoSku = config.get("mongoSku") ?? "M20";
const mongoDiskSizeGb = config.getNumber("mongoDiskSizeGb") ?? 128;

// ---------------------------------------------------------------------------
// Resource Group
// ---------------------------------------------------------------------------
const resourceGroup = new resources.ResourceGroup("rds-resource-group", {
  resourceGroupName: resourceGroupName,
  location: location,
});

// ---------------------------------------------------------------------------
// MongoDB vCore Cluster (Cosmos DB)
// ---------------------------------------------------------------------------
const mongoCluster = new documentdb.MongoCluster("rds-mongo-cluster", {
  mongoClusterName: mongoClusterName,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  administratorLogin: mongoAdminLogin,
  administratorLoginPassword: mongoAdminPassword,
  serverVersion: mongoServerVersion,
  nodeGroupSpecs: [
    {
      kind: "Shard",
      nodeCount: 1,
      sku: mongoSku,
      diskSizeGB: mongoDiskSizeGb,
      enableHa: false,
    },
  ],
});

// Construct the connection string from the cluster output
const mongoUri = pulumi
  .all([mongoCluster.connectionString, mongoAdminLogin, mongoAdminPassword])
  .apply(([connStr, login, password]) => {
    if (!connStr) {
      throw new Error("Could not retrieve MongoDB cluster connection string");
    }
    return connStr
      .replace("<user>", encodeURIComponent(login))
      .replace("<password>", encodeURIComponent(password));
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
      { name: "NODE_ENV", value: nodeEnv },
      { name: "PORT", value: "8080" },
      { name: "SCM_DO_BUILD_DURING_DEPLOYMENT", value: "true" },
      { name: "MONGO_URI", value: mongoUri },
      { name: "MONGO_DB_NAME", value: mongoDbName },
      { name: "AUTH_SECRET", value: authSecret },
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
export const mongoConnectionString = mongoUri;
