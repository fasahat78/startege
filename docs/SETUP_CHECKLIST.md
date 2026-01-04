# Production CI/CD Setup Checklist

Follow these steps to complete the productionalization of your deployment pipeline.

## ✅ Completed

- [x] Updated `cloudbuild.yaml` with automated migrations
- [x] Added Cloud SQL Proxy step for secure database access
- [x] Configured `prisma migrate deploy` (production-safe)
- [x] Created production deployment documentation
- [x] Created cleanup guide for old scripts

## 🔧 Required Setup Steps

### 1. Grant Cloud Build Permissions

Run the setup script:

```bash
./scripts/setup-cloud-build-permissions.sh
```

Or manually grant permissions:

```bash
PROJECT_ID="startege"
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
SERVICE_ACCOUNT="${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com"

# Cloud SQL Client
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/cloudsql.client"

# Cloud Run Admin
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/run.admin"

# Service Account User
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SERVICE_ACCOUNT}" \
  --role="roles/iam.serviceAccountUser"
```

### 2. Update Cloud Build Trigger

Go to: [Cloud Build Triggers](https://console.cloud.google.com/cloud-build/triggers?project=startege)

Find your trigger and add/update these substitution variables:

#### Required Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `_DATABASE_URL` | `postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5432/startege` | For migrations (via proxy) |
| `_CLOUD_SQL_INSTANCE` | `startege:us-central1:startege-db` | Cloud SQL instance name |
| `_NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyCQet...` | Your Firebase API key |
| `_NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `startege.firebaseapp.com` | Firebase auth domain |
| `_NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `startege` | Firebase project ID |
| `_NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `startege.appspot.com` | Firebase storage bucket |
| `_NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `...` | Firebase messaging sender ID |
| `_NEXT_PUBLIC_FIREBASE_APP_ID` | `...` | Firebase app ID |
| `_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_live_...` | Stripe publishable key |
| `_NEXT_PUBLIC_GCP_PROJECT_ID` | `startege` | GCP project ID |
| `_NEXT_PUBLIC_GCP_LOCATION` | `us-central1` | GCP region |
| `_NEXT_PUBLIC_APP_URL` | `https://startege-785373873454.us-central1.run.app` | Production URL |

#### Optional Variables (with defaults)

| Variable | Default Value | Notes |
|----------|---------------|-------|
| `_SERVICE_NAME` | `startege` | Cloud Run service name |
| `_REGION` | `us-central1` | GCP region |

### 3. Test the Pipeline

1. **Make a small change** (e.g., add a comment to a file)
2. **Commit and push**:
   ```bash
   git add .
   git commit -m "Test automated migration pipeline"
   git push
   ```
3. **Monitor the build**:
   ```bash
   gcloud builds list --limit=1
   gcloud builds log $(gcloud builds list --limit=1 --format="value(id)")
   ```
4. **Verify migrations ran**:
   - Check build logs for "✅ Migrations completed successfully!"
   - Check Cloud Run logs for any errors

### 4. Verify Migration History

After first successful build, verify migrations were applied:

```bash
# Connect to Cloud SQL
gcloud sql connect startege-db --user=postgres

# Check migration history
SELECT migration_name, finished_at FROM "_prisma_migrations" ORDER BY finished_at DESC;
```

## 🧪 Testing New Migrations

### Development Workflow

1. **Make schema changes** in `prisma/schema.prisma`

2. **Create migration**:
   ```bash
   npx prisma migrate dev --name descriptive_name
   ```

3. **Test locally**:
   ```bash
   npm run dev
   # Test your changes
   ```

4. **Commit and push**:
   ```bash
   git add prisma/
   git commit -m "Add migration: descriptive_name"
   git push
   ```

5. **Cloud Build automatically**:
   - Runs migrations
   - Builds application
   - Deploys to production

## 🚨 Troubleshooting

### Build Fails at Migration Step

**Check**:
1. Cloud Build service account has `Cloud SQL Client` role
2. `_DATABASE_URL` is set correctly in trigger
3. `_CLOUD_SQL_INSTANCE` matches your instance name

**View logs**:
```bash
gcloud builds list --limit=1
gcloud builds log BUILD_ID
```

### Migration Already Applied Error

**Solution**: This is normal if migration was already applied. Check migration history:
```bash
gcloud sql connect startege-db --user=postgres
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC;
```

### Cloud SQL Proxy Connection Failed

**Check**:
1. Service account has `Cloud SQL Client` role
2. Cloud SQL instance name is correct
3. Instance is in same region as Cloud Build

## 📋 Verification Checklist

After setup, verify:

- [ ] Cloud Build trigger has all required substitution variables
- [ ] Service account has Cloud SQL Client role
- [ ] Test build completes successfully
- [ ] Migrations run before deployment
- [ ] Application deploys correctly
- [ ] No manual SQL scripts needed

## 📚 Documentation

- **Main Guide**: `docs/PRODUCTION_DEPLOYMENT_GUIDE.md`
- **Cleanup Guide**: `docs/CLEANUP_MIGRATION_SCRIPTS.md`
- **This Checklist**: `docs/SETUP_CHECKLIST.md`

## 🎉 Success Criteria

You'll know it's working when:

1. ✅ Pushing to main triggers Cloud Build automatically
2. ✅ Build logs show "✅ Migrations completed successfully!"
3. ✅ Application deploys without manual SQL scripts
4. ✅ New migrations are automatically applied on each deployment

