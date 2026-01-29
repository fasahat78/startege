# Delete Vector Search Resources from GCP

This guide helps you completely remove Vertex AI Vector Search resources from Google Cloud Platform.

## Resources to Delete

Based on your configuration, the following resources need to be deleted:

- **Vector Search Index**: `3161010167949033472`
- **Index Endpoint**: `3780782882293809152`
- **Deployed Index**: `startege_vector_search_end_1767344026840`
- **Cloud Storage Bucket**: `gs://startege-vector-search`

## Method 1: Using the Automated Scripts (Recommended)

We've created two scripts to help you delete these resources:

### Option A: TypeScript Script (requires google-auth-library)

```bash
npm run delete:vector-search
# or
npx tsx scripts/delete-vector-search-resources.ts
```

### Option B: Bash Script with gcloud CLI (Recommended - no dependencies)

```bash
chmod +x scripts/delete-vector-search-gcloud.sh
./scripts/delete-vector-search-gcloud.sh
```

Both scripts will:
1. Ask for confirmation
2. Undeploy the index from the endpoint
3. Delete the index endpoint
4. Delete the Vector Search index
5. Delete the Cloud Storage bucket (bash script) or provide instructions (TypeScript script)

**Note**: Deletion operations are asynchronous and may take several minutes.

## Method 2: Manual Deletion via GCP Console

### Step 1: Undeploy the Index

1. Go to [Vertex AI Vector Search](https://console.cloud.google.com/vertex-ai/vector-search/index-endpoints?project=startege)
2. Click on your index endpoint (`3780782882293809152`)
3. Find the deployed index (`startege_vector_search_end_1767344026840`)
4. Click "Undeploy" or "Delete"
5. Wait for the operation to complete (may take a few minutes)

### Step 2: Delete the Index Endpoint

1. In the [Index Endpoints](https://console.cloud.google.com/vertex-ai/vector-search/index-endpoints?project=startege) page
2. Find your endpoint (`3780782882293809152`)
3. Click the three dots menu (⋮) → "Delete"
4. Confirm deletion
5. Wait for the operation to complete

### Step 3: Delete the Vector Search Index

1. Go to [Vector Search Indexes](https://console.cloud.google.com/vertex-ai/vector-search/indexes?project=startege)
2. Find your index (`3161010167949033472`)
3. Click the three dots menu (⋮) → "Delete"
4. Confirm deletion
5. Wait for the operation to complete

### Step 4: Delete Cloud Storage Bucket

1. Go to [Cloud Storage Buckets](https://console.cloud.google.com/storage/browser?project=startege)
2. Find the bucket: `startege-vector-search`
3. Click on the bucket
4. Click "Delete" button
5. Type the bucket name to confirm: `startege-vector-search`
6. Click "Delete"

**Alternative using gcloud CLI:**
```bash
gsutil rm -r gs://startege-vector-search
```

## Method 3: Using gcloud CLI Manually

If you prefer running commands manually:

```bash
# Set your project
gcloud config set project startege

# Undeploy the index (if still deployed)
gcloud ai index-endpoints undeploy-index \
  3780782882293809152 \
  --deployed-index-id=startege_vector_search_end_1767344026840 \
  --region=us-central1

# Delete the index endpoint
gcloud ai index-endpoints delete \
  3780782882293809152 \
  --region=us-central1

# Delete the index
gcloud ai indexes delete \
  3161010167949033472 \
  --region=us-central1

# Delete the Cloud Storage bucket
gsutil rm -r gs://startege-vector-search
```

## Verification

After deletion, verify that all resources are removed:

1. **Check Index Endpoints**: Should be empty or not show your endpoint
   - https://console.cloud.google.com/vertex-ai/vector-search/index-endpoints?project=startege

2. **Check Indexes**: Should be empty or not show your index
   - https://console.cloud.google.com/vertex-ai/vector-search/indexes?project=startege

3. **Check Cloud Storage**: Bucket should not exist
   - https://console.cloud.google.com/storage/browser?project=startege

## Cost Impact

After deleting these resources:
- ✅ No more Vector Search API costs
- ✅ No more index storage costs
- ✅ No more Cloud Storage costs for the bucket
- ✅ Reduced GCP bill

## Troubleshooting

### Error: "Resource not found"
- The resource may have already been deleted
- Check the GCP Console to verify

### Error: "Index is still deployed"
- You must undeploy the index before deleting the endpoint
- Wait for undeploy operation to complete before proceeding

### Error: "Permission denied"
- Ensure your service account has the `roles/aiplatform.admin` role
- Or use a user account with proper permissions

### Operations taking too long
- Deletion operations are asynchronous
- Check the [Operations page](https://console.cloud.google.com/vertex-ai/operations?project=startege) for status
- Some operations can take 10-30 minutes

## After Deletion

Once all resources are deleted:

1. ✅ Your application will continue to work (using keyword search)
2. ✅ No Vector Search environment variables needed
3. ✅ Reduced GCP costs
4. ✅ Cleaner GCP project

## Need Help?

If you encounter issues:
1. Check the [GCP Console Operations](https://console.cloud.google.com/vertex-ai/operations?project=startege) page
2. Review error messages in the GCP Console
3. Ensure you have proper permissions
4. Verify resource IDs are correct
