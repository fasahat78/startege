# Production Deployment Guide

This guide explains the automated CI/CD pipeline for deploying Startege to Google Cloud Platform.

## Overview

The deployment process is fully automated through Cloud Build and includes:

1. **Database Migrations** - Automatically runs Prisma migrations before deployment
2. **Docker Image Build** - Builds the Next.js application with all dependencies
3. **Container Registry Push** - Stores the built image
4. **Cloud Run Deployment** - Deploys the new version to production

## Architecture

```
GitHub Push → Cloud Build Trigger → 
  1. Start Cloud SQL Proxy
  2. Run Prisma Migrations (prisma migrate deploy)
  3. Build Docker Image
  4. Push to Container Registry
  5. Deploy to Cloud Run
```

## Prerequisites

### 1. Cloud Build Service Account Permissions

The Cloud Build service account (`PROJECT_NUMBER@cloudbuild.gserviceaccount.com`) needs:

- **Cloud SQL Client** role - To connect to Cloud SQL via proxy
- **Cloud Run Admin** role - To deploy to Cloud Run
- **Service Account User** role - To use Cloud SQL Proxy

Grant these permissions:

```bash
PROJECT_ID="startege"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/cloudsql.client"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/iam.serviceAccountUser"
```

### 2. Cloud Build Trigger Configuration

The Cloud Build trigger needs these substitution variables:

#### Required Variables

- `_NEXT_PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `_NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Firebase project ID
- `_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID
- `_NEXT_PUBLIC_FIREBASE_APP_ID` - Firebase app ID
- `_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `_NEXT_PUBLIC_GCP_PROJECT_ID` - GCP project ID
- `_NEXT_PUBLIC_GCP_LOCATION` - GCP location (e.g., `us-central1`)
- `_NEXT_PUBLIC_APP_URL` - Production app URL
- `_DATABASE_URL` - Database connection string for migrations

#### Optional Variables (with defaults)

- `_SERVICE_NAME` - Cloud Run service name (default: `startege`)
- `_REGION` - GCP region (default: `us-central1`)
- `_CLOUD_SQL_INSTANCE` - Cloud SQL instance connection name (default: `startege:us-central1:startege-db`)

## How It Works

### 1. Database Migrations

Before building the application, Cloud Build:

1. Starts Cloud SQL Proxy to securely connect to Cloud SQL
2. Waits for the proxy to be ready
3. Installs npm dependencies
4. Generates Prisma Client
5. Runs `prisma migrate deploy` to apply pending migrations

**Why `migrate deploy` instead of `db push`?**

- `prisma migrate deploy` is **production-safe** - it only applies pending migrations
- It's **idempotent** - safe to run multiple times
- It maintains **migration history** - tracks which migrations have been applied
- `db push` is for development only - it can cause data loss

### 2. Docker Build

The Docker build:

1. Copies source code
2. Installs dependencies
3. Generates Prisma Client
4. Builds Next.js application with `NEXT_PUBLIC_*` variables baked in
5. Creates optimized production image

### 3. Deployment

Cloud Run deployment:

1. Pushes image to Container Registry
2. Deploys new revision to Cloud Run
3. Routes traffic to new revision
4. Old revision is kept for rollback

## Adding New Migrations

### Development Workflow

1. **Make schema changes** in `prisma/schema.prisma`

2. **Create migration locally**:
   ```bash
   npx prisma migrate dev --name descriptive_migration_name
   ```

3. **Test migration locally**:
   ```bash
   npm run dev
   # Test your changes
   ```

4. **Commit and push**:
   ```bash
   git add prisma/
   git commit -m "Add migration: descriptive_migration_name"
   git push
   ```

5. **Cloud Build automatically**:
   - Detects the new migration file
   - Runs `prisma migrate deploy` during build
   - Applies the migration before deployment
   - Deploys the new code

### Migration Best Practices

- ✅ **Always create migrations** for schema changes
- ✅ **Use descriptive names** - `add_user_profile_table`, `add_ai_credits_index`
- ✅ **Test locally first** - Run `prisma migrate dev` before pushing
- ✅ **Review migration SQL** - Check `prisma/migrations/*/migration.sql`
- ❌ **Never edit migrations** - Once pushed, create a new migration
- ❌ **Never use `db push` in production** - Only use `migrate deploy`

## Troubleshooting

### Migrations Fail

**Error**: `Migration failed: relation already exists`

**Solution**: The migration was already applied. Check migration history:
```bash
# Connect to Cloud SQL
gcloud sql connect startege-db --user=postgres

# Check migration history
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC;
```

### Cloud SQL Proxy Connection Failed

**Error**: `Can't reach database server`

**Solution**: Check Cloud Build service account has `Cloud SQL Client` role:
```bash
PROJECT_NUMBER=$(gcloud projects describe startege --format="value(projectNumber)")
gcloud projects get-iam-policy startege \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"
```

### Build Timeout

**Error**: `Build timeout exceeded`

**Solution**: Increase timeout in `cloudbuild.yaml`:
```yaml
timeout: '1800s'  # 30 minutes
```

### Missing Environment Variables

**Error**: `NEXT_PUBLIC_* variable not set`

**Solution**: Add missing variables to Cloud Build trigger substitution variables.

## Manual Migration (Emergency Only)

If you need to run migrations manually (not recommended):

```bash
# Connect via Cloud SQL Proxy
cloud-sql-proxy startege:us-central1:startege-db --port=5432

# In another terminal
export DATABASE_URL="postgresql://postgres:PASSWORD@127.0.0.1:5432/startege"
npx prisma migrate deploy
```

## Rollback

### Rollback Application

1. Go to Cloud Run console
2. Select service `startege`
3. Go to "Revisions" tab
4. Click "Manage Traffic"
5. Route 100% traffic to previous revision

### Rollback Migration

⚠️ **Warning**: Rolling back migrations can cause data loss. Only do this if absolutely necessary.

1. Create a new migration that reverses the changes
2. Test locally first
3. Push and let Cloud Build apply it

## Monitoring

### View Build Logs

```bash
gcloud builds list --limit=10
gcloud builds log BUILD_ID
```

### View Migration Status

```bash
# Connect to Cloud SQL
gcloud sql connect startege-db --user=postgres

# Check applied migrations
SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY finished_at DESC;
```

### View Cloud Run Logs

```bash
gcloud run services logs read startege --region=us-central1 --limit=50
```

## Security Considerations

1. **Database Credentials**: Stored in Cloud Build substitution variables (encrypted)
2. **Cloud SQL Proxy**: Uses Application Default Credentials (no passwords in code)
3. **Migration Safety**: `prisma migrate deploy` only applies pending migrations
4. **Build Isolation**: Each build runs in isolated container
5. **No Manual Access**: All changes go through Git → Cloud Build pipeline

## Next Steps

- [ ] Set up monitoring alerts for failed builds
- [ ] Add pre-deployment health checks
- [ ] Set up staging environment
- [ ] Add database backup before migrations
- [ ] Implement blue-green deployments

