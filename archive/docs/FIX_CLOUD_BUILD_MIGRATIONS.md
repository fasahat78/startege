# Fix Cloud Build Migrations

## Issue

Cloud Build needs proper IAM permissions to connect to Cloud SQL via Cloud SQL Proxy.

## Solution: Grant Cloud Build Service Account Permissions

The Cloud Build service account needs the `Cloud SQL Client` role:

```bash
# Get the Cloud Build service account email
CLOUD_BUILD_SA=$(gcloud projects describe startege --format="value(projectNumber)")@cloudbuild.gserviceaccount.com

# Grant Cloud SQL Client role
gcloud projects add-iam-policy-binding startege \
  --member="serviceAccount:${CLOUD_BUILD_SA}" \
  --role="roles/cloudsql.client"
```

Or via Console:
1. Go to: https://console.cloud.google.com/iam-admin/iam?project=startege
2. Find the service account: `785373873454@cloudbuild.gserviceaccount.com`
3. Click **"Edit"** (pencil icon)
4. Click **"+ ADD ANOTHER ROLE"**
5. Select **"Cloud SQL Client"**
6. Click **"SAVE"**

---

## Alternative: Use Cloud Run Job with Custom Docker Image

If Cloud Build permissions are complex, create a custom Docker image for migrations:

### Step 1: Create Migration Dockerfile

Create `Dockerfile.migrations`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install Prisma CLI globally
RUN npm install -g prisma

# Copy only necessary files for migrations
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm install --production=false

# Default command runs migrations
CMD ["prisma", "migrate", "deploy"]
```

### Step 2: Build and Push Image

```bash
docker build -f Dockerfile.migrations -t gcr.io/startege/startege-migrations:latest .
docker push gcr.io/startege/startege-migrations:latest
```

### Step 3: Update Cloud Run Job

```bash
gcloud run jobs update startege-migrations \
  --project=startege \
  --region=us-central1 \
  --image=gcr.io/startege/startege-migrations:latest \
  --set-env-vars="DATABASE_URL=postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db" \
  --set-cloudsql-instances=startege:us-central1:startege-db
```

### Step 4: Execute Job

```bash
gcloud run jobs execute startege-migrations \
  --project=startege \
  --region=us-central1 \
  --wait
```

---

## Check Build Logs

After granting permissions, check logs:

```bash
# Get latest build ID
BUILD_ID=$(gcloud builds list --project=startege --limit=1 --format='value(id)')

# View logs (requires proper authentication)
gcloud builds log $BUILD_ID --project=startege
```

Or view in Console:
- https://console.cloud.google.com/cloud-build/builds?project=startege

---

## Verify Migrations Applied

After successful migration:

1. **Check Cloud SQL Tables**:
   - https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege
   - Click on `startege` database → **"Tables"** tab
   - Should see: `User`, `Challenge`, `ConceptCard`, `Badge`, etc.

2. **Test Application**:
   - Visit your Cloud Run URL
   - Try signing in
   - Should work without "table does not exist" errors

---

## Troubleshooting

### Error: "Permission denied" when connecting to Cloud SQL

- Ensure Cloud Build service account has `Cloud SQL Client` role
- Verify Cloud SQL instance allows connections from Cloud Build

### Error: "Can't reach database server"

- Check Cloud SQL Proxy is running correctly
- Verify `DATABASE_URL` uses `127.0.0.1:5432` (not Unix socket) for Cloud Build
- Ensure Cloud SQL instance is running

### Error: "Schema not found" or "Prisma schema not found"

- Ensure `prisma/schema.prisma` is included in the build
- Check `.gcloudignore` doesn't exclude `prisma/` directory

