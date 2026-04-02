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
}, {
  // administratorLoginPassword is write-only and always shows as a diff;
  // createMode is auto-populated by Azure
  ignoreChanges: ["administratorLoginPassword", "createMode"],
});

// Construct the connection string from config values (not from the cluster
// output, since the template contains <user>/<password> placeholders)
const mongoUri = pulumi
  .all([mongoAdminLogin, mongoAdminPassword])
  .apply(([login, password]) =>
    `mongodb+srv://${encodeURIComponent(login)}:${encodeURIComponent(password)}@${mongoClusterName}.mongocluster.cosmos.azure.com/?tls=true&authMechanism=SCRAM-SHA-256&retrywrites=false&maxIdleTimeMS=120000`,
  );

// ---------------------------------------------------------------------------
// App Service Plan (Linux)
// ---------------------------------------------------------------------------
const appServicePlan = new web.AppServicePlan("rds-service-plan", {
  name: appServicePlanName,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  kind: "linux",
  reserved: true, // Required for Linux plans
  sku: {
    name: skuName,
  },
}, {
  // Azure auto-populates these fields; ignoring prevents spurious diffs
  ignoreChanges: ["elasticScaleEnabled", "isSpot", "maximumElasticWorkerCount", "targetWorkerCount", "targetWorkerSizeId"],
});

// ---------------------------------------------------------------------------
// Web App (Node.js on Linux)
// ---------------------------------------------------------------------------
const webApp = new web.WebApp("rds-web-app", {
  name: webAppName,
  resourceGroupName: resourceGroup.name,
  location: resourceGroup.location,
  serverFarmId: appServicePlan.id,
  httpsOnly: true,
  clientAffinityEnabled: false,
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
}, {
  // Azure auto-populates these fields; ignoring prevents spurious diffs
  ignoreChanges: [
    "clientCertEnabled",
    "clientCertMode",
    "containerSize",
    "customDomainVerificationId",
    "dailyMemoryTimeQuota",
    "enabled",
    "hostNameSslStates",
    "hostNamesDisabled",
    "keyVaultReferenceIdentity",
    "kind",
    "publicNetworkAccess",
    "redundancyMode",
    "reserved",
    "storageAccountRequired",
    "vnetContentShareEnabled",
    "vnetImagePullEnabled",
    "vnetRouteAllEnabled",
    "tags",
  ],
});

// ---------------------------------------------------------------------------
// Outputs
// ---------------------------------------------------------------------------
export const appServiceUrl = pulumi.interpolate`https://${webApp.defaultHostName}`;
export const mongoConnectionString = mongoUri;
