# Vector Search Environment Variables - Cloud Run Setup

## ✅ Add to Cloud Run Environment Variables

These are **runtime variables**, not build-time variables, so they should be added directly to Cloud Run.

## Method 1: Cloud Run Console (Recommended)

1. Go to [Cloud Run Console](https://console.cloud.google.com/run)
2. Click on your service: `startege`
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Variables & Secrets"** tab
5. Under **"Variables"** section, click **"ADD VARIABLE"**
6. Add each variable:

   ```
   Name: VECTOR_SEARCH_INDEX_ID
   Value: 3161010167949033472
   ```

   ```
   Name: VECTOR_SEARCH_ENDPOINT_ID
   Value: 3780782882293809152
   ```

   ```
   Name: VECTOR_SEARCH_DEPLOYMENT_ID
   Value: startege_vector_search_end_1767344026840
   ```

7. Click **"DEPLOY"**

## Method 2: Update cloudbuild.yaml (Alternative)

If you want to set them during deployment, add them to the Cloud Run deploy step:

```yaml
# Deploy container image to Cloud Run
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - '${_SERVICE_NAME}'
    - '--image'
    - 'gcr.io/${PROJECT_ID}/startege:${SHORT_SHA}'
    - '--region'
    - '${_REGION}'
    - '--platform'
    - 'managed'
    - '--allow-unauthenticated'
    - '--memory'
    - '2Gi'
    - '--cpu'
    - '2'
    - '--timeout'
    - '300'
    - '--max-instances'
    - '10'
    - '--min-instances'
    - '0'
    # Add Vector Search environment variables
    - '--set-env-vars'
    - 'VECTOR_SEARCH_INDEX_ID=3161010167949033472,VECTOR_SEARCH_ENDPOINT_ID=3780782882293809152,VECTOR_SEARCH_DEPLOYMENT_ID=startege_vector_search_end_1767344026840'
  id: 'deploy-cloud-run'
```

## Method 3: Using GitHub Secrets (If Using CI/CD)

If you want to manage them via GitHub Secrets:

1. Add to GitHub Secrets:
   - `VECTOR_SEARCH_INDEX_ID` = `3161010167949033472`
   - `VECTOR_SEARCH_ENDPOINT_ID` = `3780782882293809152`
   - `VECTOR_SEARCH_DEPLOYMENT_ID` = `startege_vector_search_end_1767344026840`

2. Update `cloudbuild.yaml` to pass them through:
   ```yaml
   - '--set-env-vars'
   - 'VECTOR_SEARCH_INDEX_ID=${_VECTOR_SEARCH_INDEX_ID},VECTOR_SEARCH_ENDPOINT_ID=${_VECTOR_SEARCH_ENDPOINT_ID},VECTOR_SEARCH_DEPLOYMENT_ID=${_VECTOR_SEARCH_DEPLOYMENT_ID}'
   ```

3. Add substitution variables in Cloud Build trigger:
   - `_VECTOR_SEARCH_INDEX_ID` = `3161010167949033472`
   - `_VECTOR_SEARCH_ENDPOINT_ID` = `3780782882293809152`
   - `_VECTOR_SEARCH_DEPLOYMENT_ID` = `startege_vector_search_end_1767344026840`

## Recommendation

**Use Method 1 (Cloud Run Console)** because:
- ✅ Simplest and most direct
- ✅ No code changes needed
- ✅ Easy to update without redeploying
- ✅ These are not sensitive secrets (just IDs)

## Verification

After adding, verify they're set:

```bash
gcloud run services describe startege --region=us-central1 --format="value(spec.template.spec.containers[0].env)"
```

Or check in Cloud Run Console → Your service → Variables & Secrets tab.

## Notes

- These are **not sensitive** (just IDs), so Cloud Run Variables is fine
- If Vector Search env vars are missing, the app will gracefully fallback to keyword search
- No need to redeploy after adding - Cloud Run will use them on next request

