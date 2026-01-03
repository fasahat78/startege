# Google Cloud Platform Deployment Guide

This guide covers deploying Startege to Google Cloud Run via GitHub Actions.

## Prerequisites

1. **Google Cloud Project** with billing enabled
2. **Service Account** with Cloud Run Admin and Cloud Build permissions
3. **GitHub Secrets** configured (see `GITHUB_SECRETS_SETUP.md`)
4. **Cloud SQL** PostgreSQL instance running
5. **Cloud Build API** enabled

## Setup Steps

### 1. Create Service Account

```bash
# Set variables
PROJECT_ID="your-gcp-project-id"
SA_NAME="github-actions-deploy"
SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Create service account
gcloud iam service-accounts create ${SA_NAME} \
  --display-name="GitHub Actions Deployer" \
  --project=${PROJECT_ID}

# Grant necessary permissions
gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding ${PROJECT_ID} \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/storage.admin"

# Create and download key
gcloud iam service-accounts keys create gcp-sa-key.json \
  --iam-account=${SA_EMAIL} \
  --project=${PROJECT_ID}
```

### 2. Add GitHub Secret

1. Go to: https://github.com/fasahat78/startege/settings/secrets/actions
2. Add secret: `GCP_SA_KEY`
3. Value: Contents of `gcp-sa-key.json` file (full JSON)

### 3. Enable Required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  sqladmin.googleapis.com \
  --project=${PROJECT_ID}
```

### 4. Configure Cloud SQL Connection

If using Cloud SQL, configure connection:

```bash
# Get Cloud SQL instance connection name
gcloud sql instances describe INSTANCE_NAME --format="value(connectionName)"

# Update Cloud Run service to use Cloud SQL
gcloud run services update startege \
  --add-cloudsql-instances=CONNECTION_NAME \
  --region=us-central1
```

### 5. Set Up Cloud Run Service

The GitHub Actions workflow will create the service on first deployment, but you can pre-create it:

```bash
gcloud run deploy startege \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10 \
  --min-instances 0
```

## Deployment

### Automatic Deployment

1. Push to `main` branch
2. GitHub Actions will automatically:
   - Build the application
   - Run database migrations
   - Deploy to Cloud Run

### Manual Deployment

1. Go to: https://github.com/fasahat78/startege/actions
2. Select "Deploy to Google Cloud Run"
3. Click "Run workflow"
4. Select branch: `main`
5. Click "Run workflow"

## Environment Variables

All environment variables are set via GitHub Secrets and passed to Cloud Run during deployment. See `.github/workflows/deploy-gcp.yml` for the complete list.

## Monitoring

### View Logs

```bash
gcloud run services logs read startege --region us-central1 --limit 50
```

### View Service Status

```bash
gcloud run services describe startege --region us-central1
```

### Check Health Endpoint

```bash
SERVICE_URL=$(gcloud run services describe startege --region us-central1 --format 'value(status.url)')
curl ${SERVICE_URL}/api/health
```

## Custom Domain Setup

1. **Map domain to Cloud Run:**
   ```bash
   gcloud run domain-mappings create \
     --service startege \
     --domain startege.com \
     --region us-central1
   ```

2. **Update DNS:**
   - Add CNAME record pointing to the provided Cloud Run domain
   - Wait for DNS propagation

3. **Update GitHub Secret:**
   - Update `NEXT_PUBLIC_APP_URL` to your custom domain

## Scaling Configuration

Current settings in workflow:
- **Memory**: 2Gi
- **CPU**: 2
- **Timeout**: 300 seconds
- **Max Instances**: 10
- **Min Instances**: 0 (scales to zero)

Adjust in `.github/workflows/deploy-gcp.yml` if needed.

## Troubleshooting

### Build Failures
- Check GitHub Actions logs
- Verify all secrets are set
- Ensure Cloud Build API is enabled

### Deployment Failures
- Check Cloud Run logs: `gcloud run services logs read startege`
- Verify service account permissions
- Check Cloud SQL connection if using

### Database Connection Issues
- Verify `DATABASE_URL` secret is correct
- Check Cloud SQL instance is running
- Ensure Cloud Run can connect to Cloud SQL (configure Cloud SQL connection)

## Cost Optimization

- **Min instances**: Set to 0 for cost savings (cold starts on first request)
- **Max instances**: Adjust based on traffic
- **Memory/CPU**: Start with 2Gi/2 CPU, adjust based on performance

## Security

- Service account has minimal required permissions
- Environment variables stored securely in GitHub Secrets
- Cloud Run uses HTTPS by default
- No public IPs exposed (managed by Google)

## Next Steps

1. Set up monitoring and alerts
2. Configure custom domain
3. Set up Cloud SQL backups
4. Configure CDN (Cloud CDN) for static assets
5. Set up Cloud Armor for DDoS protection

