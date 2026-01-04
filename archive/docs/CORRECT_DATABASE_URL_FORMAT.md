# Correct DATABASE_URL Format for Cloud SQL Unix Sockets

## ✅ Correct Format (Per Prisma Documentation)

```
postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db
```

## Why `localhost` is Required

According to Prisma's official documentation:
> **"The `@localhost` part is required. While the value is ignored, its presence indicates to Prisma that a Unix socket connection is intended."**

## Key Components

- **`@localhost`**: Required indicator for Unix socket mode (value is ignored)
- **`?host=/cloudsql/...`**: Specifies the Unix socket directory path
- **Password encoding**: `@` in password must be URL-encoded as `%40`

## Critical Prerequisites

### 1. Cloud SQL Connection Must Be Configured in Cloud Run

**This is the most common cause of connection failures!**

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click `startege` → **"EDIT & DEPLOY NEW REVISION"**
3. Go to **"Connections"** tab
4. Under **"Cloud SQL connections"**, verify `startege-db` is listed
5. If NOT listed:
   - Click **"+ ADD CLOUD SQL CONNECTION"**
   - Select `startege-db`
   - Click **"DEPLOY"**

### 2. Cloud SQL Instance Must Have Private IP

- Go to: https://console.cloud.google.com/sql/instances/startege-db?project=startege
- Verify **"Private IP"** is enabled
- If not enabled, enable it (requires VPC peering)

### 3. Cloud Run Service Account Permissions

The Cloud Run service account needs:
- `Cloud SQL Client` role
- Access to the VPC network (if using Private IP)

## Update DATABASE_URL in Cloud Run

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click `startege` → **"EDIT & DEPLOY NEW REVISION"**
3. Go to **"Variables & Secrets"** tab
4. Find `DATABASE_URL` environment variable
5. **Set to**:
   ```
   postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db
   ```
6. Click **"DEPLOY"**

## Troubleshooting

### Error: `Can't reach database server at /cloudsql/...:5432`

**Cause**: Cloud SQL connection not configured in Cloud Run, or Prisma is using TCP mode.

**Fix**:
1. Verify Cloud SQL connection is added in Cloud Run (see above)
2. Ensure `DATABASE_URL` uses `@localhost` format
3. Redeploy the service

### Error: `empty host in database URL`

**Cause**: Missing `@localhost` in connection string.

**Fix**: Use `@localhost` (not `@/`)

### Error: `Permission denied`

**Cause**: Cloud Run service account lacks Cloud SQL Client role.

**Fix**: Grant `Cloud SQL Client` role to Cloud Run service account:
```bash
gcloud projects add-iam-policy-binding startege \
  --member="serviceAccount:785373873454-compute@developer.gserviceaccount.com" \
  --role="roles/cloudsql.client"
```

## References

- [Prisma PostgreSQL Connection URLs](https://www.prisma.io/docs/orm/reference/connection-urls)
- [Google Cloud SQL Connect from Cloud Run](https://cloud.google.com/sql/docs/postgres/connect-run)
- [Prisma Cloud SQL Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-google-cloud-run)

