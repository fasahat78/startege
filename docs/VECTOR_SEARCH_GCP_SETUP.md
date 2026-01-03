# Vertex AI Vector Search - GCP Setup Guide

**Date**: 2025-02-11  
**Purpose**: Set up Vertex AI Vector Search for semantic search in Startegizer RAG

---

## 🎯 Overview

This guide walks you through setting up Vertex AI Vector Search in Google Cloud Platform to enable semantic search for Startegizer's RAG system.

---

## 📋 Prerequisites

1. ✅ GCP Project created (`startege`)
2. ✅ Vertex AI API enabled
3. ✅ Service account with Vertex AI User role
4. ✅ Billing enabled (Vector Search requires billing)

---

## Step 1: Enable Vector Search API

1. Go to [GCP Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** > **Library**
3. Search for "Vertex AI Vector Search API"
4. Click **Enable**
5. Wait for activation (may take a few minutes)

---

## Step 2: Create Vector Search Index

### Option A: Using GCP Console (Recommended for first-time setup)

1. Go to **Vertex AI** > **Vector Search** in GCP Console
2. Click **Create Index**
3. Fill in:
   - **Index Name**: `startege-knowledge-base`
   - **Description**: `Vector Search index for Startegizer RAG (Market Scan + Standards)`
   - **Region**: `us-central1` (or your preferred region)
   - **Embedding Dimensions**: `768` (for text-embedding-004)
   - **Distance Measure Type**: `Cosine Distance`
   - **Algorithm**: `Tree-AH` (Approximate Nearest Neighbor)
4. Click **Create**
5. Note thewh **Index ID** (you'll need this for `VECTOR_SEARCH_INDEX_ID`)

### Option B: Using gcloud CLI

```bash
# Set variables
PROJECT_ID="startege"
LOCATION="us-central1"
INDEX_ID="startege-knowledge-base"

# Create index
gcloud ai indexes create \
  --project=$PROJECT_ID \
  --region=$LOCATION \
  --display-name=$INDEX_ID \
  --description="Vector Search index for Startegizer RAG" \
  --metadata-file=index-metadata.json
```

**index-metadata.json**:
```json
{
  "contentsDeltaUri": "gs://your-bucket/embeddings",
  "config": {
    "dimensions": 768,
    "approximateNeighborsCount": 10,
    "distanceMeasureType": "COSINE_DISTANCE",
    "algorithmConfig": {
      "treeAhConfig": {
        "leafNodeEmbeddingCount": 500,
        "leafNodesToSearchPercent": 10
      }
    }
  }
}
```

---

## Step 3: Deploy Index to Endpoint

1. In **Vertex AI** > **Vector Search**, select your index
2. Click **Deploy to Endpoint**
3. Fill in:
   - **Endpoint Name**: `startege-vector-search-endpoint`
   - **Region**: Same as index (`us-central1`)
   - **Machine Type**: `e2-standard-2` (or higher for production)
   - **Min Replicas**: `1`
   - **Max Replicas**: `3` (for auto-scaling)
4. Click **Deploy**
5. Wait for deployment (5-10 minutes)
6. Note the **Endpoint ID** (you'll need this for `VECTOR_SEARCH_ENDPOINT_ID`)

---

## Step 4: Configure Environment Variables

Add to your `.env` file:

```bash
# Vector Search Configuration
VECTOR_SEARCH_INDEX_ID=startege-knowledge-base
VECTOR_SEARCH_ENDPOINT_ID=your-endpoint-id-here
```

**Note**: Replace `your-endpoint-id-here` with the actual endpoint ID from Step 3.

---

## Step 5: Grant Service Account Permissions

Your service account needs these roles:
- ✅ **Vertex AI User** (already have)
- ✅ **Storage Object Viewer** (if using Cloud Storage for embeddings)

To grant Storage Object Viewer:
```bash
gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:startegizer-gemini@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/storage.objectViewer"
```

---

## Step 6: Test the Setup

Run the test script:

```bash
npm run test:vector-search
```

Or manually test:

```typescript
import { generateEmbedding } from '@/lib/vector-db/embeddings';
import { isVectorSearchConfigured } from '@/lib/vector-db/config';

if (isVectorSearchConfigured()) {
  const embedding = await generateEmbedding("Test text");
  console.log("Embedding generated:", embedding.length, "dimensions");
} else {
  console.log("Vector Search not configured");
}
```

---

## 📊 Index Configuration Details

### Recommended Settings

- **Dimensions**: `768` (matches text-embedding-004)
- **Distance**: `COSINE_DISTANCE` (best for text embeddings)
- **Algorithm**: `Tree-AH` (good balance of speed/accuracy)
- **Leaf Nodes**: `500` (default, good for most use cases)
- **Search Percent**: `10%` (faster queries, still accurate)

### Production Considerations

- **Machine Type**: `e2-standard-4` or higher for production
- **Min Replicas**: `2` for high availability
- **Max Replicas**: `5` for auto-scaling during peak usage
- **Index Updates**: Plan for incremental updates (new articles/standards)

---

## 🔧 Troubleshooting

### Error: "Index not found"
- Check `VECTOR_SEARCH_INDEX_ID` matches the actual index ID
- Verify index exists in GCP Console

### Error: "Endpoint not found"
- Check `VECTOR_SEARCH_ENDPOINT_ID` matches the actual endpoint ID
- Verify endpoint is deployed and active

### Error: "Permission denied"
- Verify service account has Vertex AI User role
- Check IAM permissions in GCP Console

### Error: "Billing not enabled"
- Vector Search requires billing to be enabled
- Enable billing in GCP Console

---

## 💰 Cost Considerations

### Vertex AI Vector Search Pricing

- **Index Storage**: ~$0.10 per GB/month
- **Query Cost**: ~$0.10 per 1,000 queries
- **Embedding Generation**: ~$0.0001 per 1K tokens

### Estimated Monthly Costs (for Startegizer)

- **Index Storage**: ~$1-5/month (depends on content volume)
- **Queries**: ~$1-10/month (depends on usage)
- **Embeddings**: ~$0.50-2/month (depends on new content)

**Total**: ~$2.50-17/month (scales with usage)

---

## ✅ Verification Checklist

- [ ] Vector Search API enabled
- [ ] Index created with correct dimensions (768)
- [ ] Index deployed to endpoint
- [ ] Environment variables set (`VECTOR_SEARCH_INDEX_ID`, `VECTOR_SEARCH_ENDPOINT_ID`)
- [ ] Service account has proper permissions
- [ ] Test embedding generation works
- [ ] Billing enabled

---

## 🚀 Next Steps

After setup is complete:

1. ✅ Generate embeddings for existing articles
2. ✅ Generate embeddings for existing standards
3. ✅ Update RAG query engine to use semantic search
4. ✅ Test citation quality improvements

---

**Status**: Ready for GCP Setup  
**Next**: Follow steps above, then proceed with Phase 4.2-4.7

