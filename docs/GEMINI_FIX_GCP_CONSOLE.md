# Fix Gemini Issues - GCP Console (Web UI) Instructions

Step-by-step instructions using the GCP Console web interface.

## 1. Check Current Configuration

### Step 1.1: View Cloud Run Environment Variables
1. Go to: https://console.cloud.google.com/run
2. Click on service: **startege**
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Scroll to **"Variables & Secrets"** tab
5. Check **"Environment variables"** section:
   - Look for `GCP_PROJECT_ID` - should be `startege` (not the number)
   - Look for `GCP_LOCATION` - should be `us-central1`
   - Look for `GEMINI_MODEL` (optional)

### Step 1.2: Check Service Account
1. In the same **"EDIT & DEPLOY NEW REVISION"** page
2. Scroll to **"Security"** tab
3. Check **"Service account"** field
4. Note the service account email (e.g., `785373873454-compute@developer.gserviceaccount.com`)

## 2. Fix Service Account Permissions

### Step 2.1: Grant Vertex AI User Role
1. Go to: https://console.cloud.google.com/iam-admin/iam
2. Find your service account (from Step 1.2)
3. Click the **pencil icon** (Edit) next to the service account
4. Click **"+ ADD ANOTHER ROLE"**
5. Search for: `Vertex AI User`
6. Select: **"Vertex AI User"** (roles/aiplatform.user)
7. Click **"SAVE"**

**Alternative Method:**
1. Go to: https://console.cloud.google.com/iam-admin/iam
2. Click **"GRANT ACCESS"** button (top)
3. In **"New principals"**, enter your service account email
4. Click **"Select a role"** dropdown
5. Search for: `Vertex AI User`
6. Select: **"Vertex AI User"**
7. Click **"SAVE"**

## 3. Fix Project ID (Use Project Name)

### Step 3.1: Update GCP_PROJECT_ID
1. Go to: https://console.cloud.google.com/run
2. Click on service: **startege**
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Variables & Secrets"** tab
5. In **"Environment variables"** section:
   - Find `GCP_PROJECT_ID`
   - Click the **pencil icon** to edit
   - Change value from `785373873454` to `startege`
   - Click **"SAVE"**
6. Click **"DEPLOY"** button (bottom right)

## 4. Check Logs for Errors

### Step 4.1: View Recent Logs
1. Go to: https://console.cloud.google.com/run
2. Click on service: **startege**
3. Click **"LOGS"** tab
4. In the filter/search box, type: `[GEMINI_ERROR]`
5. Click **"Apply"**
6. Review error messages

### Step 4.2: View All Startegizer Logs
1. Go to: https://console.cloud.google.com/logs
2. In **"Resource"** dropdown, select: **Cloud Run Revision**
3. In **"Service name"**, select: **startege**
4. In search box, type: `[STARTEGIZER_CHAT]`
5. Click **"Run query"**
6. Look for logs showing which AI provider is being used

## 5. Verify Vertex AI API is Enabled

### Step 5.1: Check API Status
1. Go to: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
2. Verify it shows **"API Enabled"** (green checkmark)
3. If not enabled, click **"ENABLE"** button

## 6. Set Model (Optional - Try Different Model)

### Step 6.1: Change Gemini Model
1. Go to: https://console.cloud.google.com/run
2. Click on service: **startege**
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Variables & Secrets"** tab
5. In **"Environment variables"** section:
   - Click **"+ Add variable"**
   - Name: `GEMINI_MODEL`
   - Value: `gemini-1.5-flash` (or `gemini-1.5-pro`)
   - Click **"SAVE"**
6. Click **"DEPLOY"** button

## 7. Verify OpenAI Secret is Configured

### Step 7.1: Check Secret Configuration
1. Go to: https://console.cloud.google.com/run
2. Click on service: **startege**
3. Click **"EDIT & DEPLOY NEW REVISION"**
4. Go to **"Variables & Secrets"** tab
5. In **"Secrets exposed as environment variables"** section:
   - Verify `OPENAI_API_KEY` is listed
   - Secret should be: `OPENAI_API_KEY`
   - Version should be: `latest`
6. If not present, click **"+ Add secret"**:
   - Name: `OPENAI_API_KEY`
   - Secret: Select `OPENAI_API_KEY` from dropdown
   - Version: Select `latest`
   - Click **"SAVE"**

## 8. Test After Fixes

### Step 8.1: Make a Test Request
1. Go to your Startegizer interface
2. Ask a question (e.g., "define NIST")
3. Check the response

### Step 8.2: Verify in Logs
1. Go to: https://console.cloud.google.com/logs
2. Filter by: **Cloud Run Revision** → **startege**
3. Search for: `Using AI provider`
4. Should show: `openai` or `gemini`

## 9. Quick Fix Checklist (Do These in Order)

1. ✅ **Fix Project ID**
   - Cloud Run → startege → Edit → Variables & Secrets
   - Change `GCP_PROJECT_ID` from `785373873454` to `startege`
   - Deploy

2. ✅ **Grant Permissions**
   - IAM & Admin → Find service account → Edit
   - Add role: **Vertex AI User**
   - Save

3. ✅ **Verify OpenAI Secret**
   - Cloud Run → startege → Edit → Variables & Secrets
   - Ensure `OPENAI_API_KEY` secret is configured
   - Deploy if changed

4. ✅ **Check Logs**
   - Cloud Run → startege → Logs
   - Look for `[GEMINI_ERROR]` or `Using AI provider`

## 10. Common Issues and Solutions

### Issue: "Permission Denied"
**Solution:**
- Go to IAM & Admin → Find service account → Add role "Vertex AI User"

### Issue: "Project Not Found"
**Solution:**
- Change `GCP_PROJECT_ID` from number to project name (`startege`)

### Issue: "API Not Enabled"
**Solution:**
- Go to APIs & Services → Enable "Vertex AI API"

### Issue: Still Using Mock Response
**Solution:**
- Check logs for `[GEMINI_ERROR]` or `[OPENAI_ERROR]`
- Verify secrets are configured correctly
- OpenAI should work automatically as fallback

## 11. Monitor Real-Time

### Step 11.1: Watch Logs Live
1. Go to: https://console.cloud.google.com/logs
2. Select: **Cloud Run Revision** → **startege**
3. Click **"Stream logs"** button (top right)
4. Make a request in Startegizer
5. Watch logs appear in real-time

## Direct Links

- **Cloud Run Service**: https://console.cloud.google.com/run/detail/us-central1/startege
- **IAM & Admin**: https://console.cloud.google.com/iam-admin/iam
- **Logs**: https://console.cloud.google.com/logs
- **APIs & Services**: https://console.cloud.google.com/apis/dashboard
- **Secret Manager**: https://console.cloud.google.com/security/secret-manager
