/**
 * Comprehensive Cloud Run and Database Connection Diagnostic Script
 * 
 * Usage: npx tsx scripts/diagnose-cloud-run.ts
 * 
 * Checks:
 * 1. Cloud Run service configuration
 * 2. Cloud SQL connection configuration
 * 3. DATABASE_URL secret configuration
 * 4. IAM permissions
 * 5. Cloud SQL instance status
 * 6. Health endpoint status
 */

import { execSync } from "child_process";

const PROJECT_ID = "startege";
const SERVICE_NAME = "startege";
const REGION = "us-central1";
const CLOUD_SQL_INSTANCE = "startege-db";
const SECRET_NAME = "DATABASE_URL";

interface CheckResult {
  name: string;
  status: "✅" | "❌" | "⚠️";
  message: string;
  details?: any;
}

const results: CheckResult[] = [];

function checkGCloudAuth() {
  console.log("🔍 Checking gcloud authentication...");
  
  const authCmd = `gcloud auth list --filter=status:ACTIVE --format="value(account)"`;
  const authResult = runCommand(authCmd);
  
  if (!authResult.success || !authResult.output) {
    console.error("\n❌ gcloud is not authenticated!");
    console.error("\nPlease run:");
    console.error("  gcloud auth login");
    console.error("\nOr if you're already logged in:");
    console.error("  gcloud config set account YOUR_EMAIL");
    process.exit(1);
  }
  
  console.log(`✅ Authenticated as: ${authResult.output}`);
  
  // Check if project is set
  const projectCmd = `gcloud config get-value project`;
  const projectResult = runCommand(projectCmd);
  
  if (projectResult.success && projectResult.output) {
    console.log(`✅ Project set to: ${projectResult.output}`);
  } else {
    console.log(`⚠️  Setting project to: ${PROJECT_ID}`);
    runCommand(`gcloud config set project ${PROJECT_ID}`);
  }
  
  return true;
}

function runCommand(command: string): { success: boolean; output: string; error?: string } {
  try {
    const output = execSync(command, { encoding: "utf-8", stdio: "pipe" });
    return { success: true, output: output.trim() };
  } catch (error: any) {
    return { success: false, output: "", error: error.message };
  }
}

function checkCloudRunService() {
  console.log("\n🔍 Checking Cloud Run Service Configuration...");
  
  const cmd = `gcloud run services describe ${SERVICE_NAME} --project=${PROJECT_ID} --region=${REGION} --format=json`;
  const result = runCommand(cmd);
  
  if (!result.success) {
    results.push({
      name: "Cloud Run Service",
      status: "❌",
      message: `Failed to get service info: ${result.error}`,
    });
    return;
  }
  
  try {
    const service = JSON.parse(result.output);
    results.push({
      name: "Cloud Run Service",
      status: "✅",
      message: `Service exists and is ${service.status.conditions?.[0]?.status || "unknown"}`,
      details: {
        url: service.status.url,
        status: service.status.conditions,
      },
    });
  } catch (error) {
    results.push({
      name: "Cloud Run Service",
      status: "❌",
      message: `Failed to parse service info: ${error}`,
    });
  }
}

function checkCloudSQLConnection() {
  console.log("🔍 Checking Cloud SQL Connection Configuration...");
  
  const cmd = `gcloud run services describe ${SERVICE_NAME} --project=${PROJECT_ID} --region=${REGION} --format="value(spec.template.spec.containers[0].env)"`;
  const result = runCommand(cmd);
  
  // Also check for Cloud SQL connections
  const connectionsCmd = `gcloud run services describe ${SERVICE_NAME} --project=${PROJECT_ID} --region=${REGION} --format=json`;
  const connectionsResult = runCommand(connectionsCmd);
  
  if (connectionsResult.success) {
    try {
      const service = JSON.parse(connectionsResult.output);
      const cloudSqlConnections = service.spec?.template?.metadata?.annotations?.["run.googleapis.com/cloudsql-instances"];
      
      if (cloudSqlConnections) {
        const connections = cloudSqlConnections.split(",").map((c: string) => c.trim());
        const hasCorrectConnection = connections.some((c: string) => 
          c.includes(CLOUD_SQL_INSTANCE) || c === `${PROJECT_ID}:${REGION}:${CLOUD_SQL_INSTANCE}`
        );
        
        if (hasCorrectConnection) {
          results.push({
            name: "Cloud SQL Connection",
            status: "✅",
            message: `Cloud SQL connection configured: ${cloudSqlConnections}`,
            details: { connections },
          });
        } else {
          results.push({
            name: "Cloud SQL Connection",
            status: "❌",
            message: `Cloud SQL connection NOT configured. Found: ${cloudSqlConnections}. Expected: ${PROJECT_ID}:${REGION}:${CLOUD_SQL_INSTANCE}`,
            details: { 
              found: connections,
              expected: `${PROJECT_ID}:${REGION}:${CLOUD_SQL_INSTANCE}`,
            },
          });
        }
      } else {
        results.push({
          name: "Cloud SQL Connection",
          status: "❌",
          message: "Cloud SQL connection NOT configured in Cloud Run service",
          details: {
            fix: `Run: gcloud run services update ${SERVICE_NAME} --add-cloudsql-instances=${PROJECT_ID}:${REGION}:${CLOUD_SQL_INSTANCE} --region=${REGION}`,
          },
        });
      }
    } catch (error) {
      results.push({
        name: "Cloud SQL Connection",
        status: "⚠️",
        message: `Could not parse connection info: ${error}`,
      });
    }
  }
}

function checkDatabaseURLSecret() {
  console.log("🔍 Checking DATABASE_URL Secret Configuration...");
  
  // Check if secret exists
  const secretCmd = `gcloud secrets describe ${SECRET_NAME} --project=${PROJECT_ID} --format=json`;
  const secretResult = runCommand(secretCmd);
  
  if (!secretResult.success) {
    results.push({
      name: "DATABASE_URL Secret",
      status: "❌",
      message: `Secret ${SECRET_NAME} does not exist: ${secretResult.error}`,
    });
    return;
  }
  
  try {
    const secret = JSON.parse(secretResult.output);
    results.push({
      name: "DATABASE_URL Secret",
      status: "✅",
      message: `Secret exists: ${secret.name}`,
    });
    
    // Check if Cloud Run references it
    const serviceCmd = `gcloud run services describe ${SERVICE_NAME} --project=${PROJECT_ID} --region=${REGION} --format=json`;
    const serviceResult = runCommand(serviceCmd);
    
    if (serviceResult.success) {
      const service = JSON.parse(serviceResult.output);
      const envVars = service.spec?.template?.spec?.containers?.[0]?.env || [];
      const secrets = service.spec?.template?.spec?.containers?.[0]?.envFrom || [];
      
      const hasDatabaseUrl = envVars.some((e: any) => e.name === "DATABASE_URL") ||
                            secrets.some((s: any) => s.secretRef?.name === SECRET_NAME);
      
      if (hasDatabaseUrl) {
        results.push({
          name: "DATABASE_URL in Cloud Run",
          status: "✅",
          message: "DATABASE_URL is configured in Cloud Run service",
        });
      } else {
        results.push({
          name: "DATABASE_URL in Cloud Run",
          status: "❌",
          message: "DATABASE_URL is NOT configured in Cloud Run service",
          details: {
            fix: `Add DATABASE_URL secret reference in Cloud Run console or via: gcloud run services update ${SERVICE_NAME} --update-secrets DATABASE_URL=${SECRET_NAME}:latest --region=${REGION}`,
          },
        });
      }
    }
  } catch (error) {
    results.push({
      name: "DATABASE_URL Secret",
      status: "⚠️",
      message: `Could not parse secret info: ${error}`,
    });
  }
}

function checkCloudSQLInstance() {
  console.log("🔍 Checking Cloud SQL Instance Status...");
  
  const cmd = `gcloud sql instances describe ${CLOUD_SQL_INSTANCE} --project=${PROJECT_ID} --format=json`;
  const result = runCommand(cmd);
  
  if (!result.success) {
    results.push({
      name: "Cloud SQL Instance",
      status: "❌",
      message: `Instance ${CLOUD_SQL_INSTANCE} not found or inaccessible: ${result.error}`,
    });
    return;
  }
  
  try {
    const instance = JSON.parse(result.output);
    const state = instance.state;
    const connectionName = instance.connectionName;
    
    if (state === "RUNNABLE") {
      results.push({
        name: "Cloud SQL Instance",
        status: "✅",
        message: `Instance is running. Connection name: ${connectionName}`,
        details: {
          state,
          connectionName,
          expectedConnectionName: `${PROJECT_ID}:${REGION}:${CLOUD_SQL_INSTANCE}`,
        },
      });
    } else {
      results.push({
        name: "Cloud SQL Instance",
        status: "❌",
        message: `Instance is ${state}. Expected: RUNNABLE`,
        details: { state, connectionName },
      });
    }
  } catch (error) {
    results.push({
      name: "Cloud SQL Instance",
      status: "⚠️",
      message: `Could not parse instance info: ${error}`,
    });
  }
}

function checkIAMPermissions() {
  console.log("🔍 Checking IAM Permissions...");
  
  const serviceAccount = `${PROJECT_ID}-compute@developer.gserviceaccount.com`;
  const cmd = `gcloud projects get-iam-policy ${PROJECT_ID} --flatten="bindings[].members" --filter="bindings.members:${serviceAccount}" --format=json`;
  const result = runCommand(cmd);
  
  if (result.success) {
    try {
      const bindings = JSON.parse(result.output);
      const hasSecretAccessor = bindings.some((b: any) => 
        b.bindings?.role === "roles/secretmanager.secretAccessor"
      );
      
      if (hasSecretAccessor) {
        results.push({
          name: "IAM Permissions",
          status: "✅",
          message: `Service account has Secret Manager access`,
        });
      } else {
        results.push({
          name: "IAM Permissions",
          status: "❌",
          message: `Service account missing Secret Manager Secret Accessor role`,
          details: {
            fix: `Run: gcloud projects add-iam-policy-binding ${PROJECT_ID} --member="serviceAccount:${serviceAccount}" --role="roles/secretmanager.secretAccessor"`,
          },
        });
      }
    } catch (error) {
      results.push({
        name: "IAM Permissions",
        status: "⚠️",
        message: `Could not check permissions: ${error}`,
      });
    }
  }
}

function checkHealthEndpoint() {
  console.log("🔍 Checking Health Endpoint...");
  
  const serviceCmd = `gcloud run services describe ${SERVICE_NAME} --project=${PROJECT_ID} --region=${REGION} --format="value(status.url)"`;
  const urlResult = runCommand(serviceCmd);
  
  if (urlResult.success && urlResult.output) {
    const url = urlResult.output.trim();
    const healthUrl = `${url}/api/health`;
    
    const curlCmd = `curl -s -w "\\nHTTP_CODE:%{http_code}" "${healthUrl}"`;
    const healthResult = runCommand(curlCmd);
    
    if (healthResult.success) {
      const [body, code] = healthResult.output.split("HTTP_CODE:");
      try {
        const health = JSON.parse(body);
        const dbStatus = health.checks?.database?.status;
        
        if (dbStatus === "healthy") {
          results.push({
            name: "Health Endpoint",
            status: "✅",
            message: `Database connection is healthy`,
            details: health.checks,
          });
        } else {
          results.push({
            name: "Health Endpoint",
            status: "❌",
            message: `Database connection is unhealthy: ${health.checks?.database?.message}`,
            details: health.checks,
          });
        }
      } catch (error) {
        results.push({
          name: "Health Endpoint",
          status: "⚠️",
          message: `Could not parse health response: ${body}`,
        });
      }
    } else {
      results.push({
        name: "Health Endpoint",
        status: "⚠️",
        message: `Could not reach health endpoint: ${healthResult.error}`,
      });
    }
  }
}

async function main() {
  console.log("🚀 Cloud Run & Database Connection Diagnostic");
  console.log("=" .repeat(60));
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Service: ${SERVICE_NAME}`);
  console.log(`Region: ${REGION}`);
  console.log(`Cloud SQL: ${CLOUD_SQL_INSTANCE}`);
  console.log("=" .repeat(60));
  
  // Check authentication first
  checkGCloudAuth();
  
  checkCloudRunService();
  checkCloudSQLConnection();
  checkDatabaseURLSecret();
  checkCloudSQLInstance();
  checkIAMPermissions();
  checkHealthEndpoint();
  
  console.log("\n" + "=" .repeat(60));
  console.log("📊 Diagnostic Results");
  console.log("=" .repeat(60));
  
  results.forEach((result) => {
    console.log(`\n${result.status} ${result.name}`);
    console.log(`   ${result.message}`);
    if (result.details) {
      console.log(`   Details:`, JSON.stringify(result.details, null, 2));
    }
  });
  
  const hasErrors = results.some((r) => r.status === "❌");
  const hasWarnings = results.some((r) => r.status === "⚠️");
  
  console.log("\n" + "=" .repeat(60));
  if (hasErrors) {
    console.log("❌ Issues found. Please fix the errors above.");
    process.exit(1);
  } else if (hasWarnings) {
    console.log("⚠️  Some checks had warnings. Review above.");
    process.exit(0);
  } else {
    console.log("✅ All checks passed!");
    process.exit(0);
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

