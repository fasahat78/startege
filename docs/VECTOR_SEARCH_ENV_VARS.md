# Vector Search Environment Variables

Based on your GCP Console screenshots, here are your Vector Search IDs:

## Environment Variables

```bash
# Vector Search Configuration
VECTOR_SEARCH_INDEX_ID=3161010167949033472
VECTOR_SEARCH_ENDPOINT_ID=3780782882293809152
VECTOR_SEARCH_DEPLOYMENT_ID=startege_vector_search_end_1767344026840

# GCP Configuration (if not already set)
GCP_PROJECT_ID=785373873454
GCP_LOCATION=us-central1
```

## Where These Values Come From

### VECTOR_SEARCH_INDEX_ID
- **Value**: `3161010167949033472`
- **Source**: From the "Index" link in "Deployed index info" section
- **Format**: `projects/785373873454/locations/us-central1/indexes/3161010167949033472`
- **Extract**: The number after `/indexes/`

### VECTOR_SEARCH_ENDPOINT_ID
- **Value**: `3780782882293809152`
- **Source**: From the "Endpoint info" section (ID field) OR from the "Index endpoint" link
- **Format**: `projects/785373873454/locations/us-central1/indexEndpoints/3780782882293809152`
- **Extract**: The number after `/indexEndpoints/`

### VECTOR_SEARCH_DEPLOYMENT_ID
- **Value**: `startege_vector_search_end_1767344026840`
- **Source**: From the "Deployed index info" section, "ID" field
- **Note**: This is the deployment ID, not the display name

## How to Add to Your Environment

### Local Development (.env.local)

Add these lines to your `.env.local` file:

```bash
VECTOR_SEARCH_INDEX_ID=3161010167949033472
VECTOR_SEARCH_ENDPOINT_ID=3780782882293809152
VECTOR_SEARCH_DEPLOYMENT_ID=startege_vector_search_end_1767344026840
GCP_PROJECT_ID=785373873454
GCP_LOCATION=us-central1
```

### Production (GitHub Secrets)

Add these as secrets in your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add each variable:
   - `VECTOR_SEARCH_INDEX_ID` = `3161010167949033472`
   - `VECTOR_SEARCH_ENDPOINT_ID` = `3780782882293809152`
   - `VECTOR_SEARCH_DEPLOYMENT_ID` = `startege_vector_search_end_1767344026840`

## Verify Configuration

After adding these variables, test with:

```bash
# Check if Vector Search is configured
npx tsx -e "
import { isVectorSearchConfigured, getVectorSearchConfig } from './lib/vector-db/config';
console.log('Vector Search Configured:', isVectorSearchConfigured());
if (isVectorSearchConfigured()) {
  const config = getVectorSearchConfig();
  console.log('Config:', JSON.stringify(config, null, 2));
} else {
  console.log('❌ Vector Search not configured - check environment variables');
}
"
```

## Next Steps

1. ✅ Add environment variables to `.env.local`
2. ✅ Add environment variables to GitHub Secrets
3. ✅ Test configuration with the verify script above
4. ✅ Run backfill scripts to generate embeddings:
   ```bash
   npx tsx scripts/backfill-all-embeddings.ts
   ```
5. ✅ Test semantic search:
   ```bash
   npx tsx scripts/test-vector-search.ts
   ```

