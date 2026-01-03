# Service Account Setup - Quick Reference

## Current Status
- ✅ Service account created: `startegizer-gemini@startege.iam.gserviceaccount.com`
- ✅ Service account key downloaded and secured
- ⏳ **NEXT: Grant Vertex AI permissions**

---

## Step-by-Step: Grant Vertex AI Access

### Option 1: From Service Account Permissions Page (You are here)

1. **Click "Manage access" button** (blue button on the page)
   - This takes you to the IAM page

2. **Click "GRANT ACCESS"** (top right, blue button)

3. **Add Principal:**
   - In "New principals" field, enter:
     ```
     startegizer-gemini@startege.iam.gserviceaccount.com
     ```

4. **Select Role:**
   - Click "Select a role" dropdown
   - Search for: `Vertex AI User`
   - Select: **Vertex AI User** (roles/aiplatform.user)

5. **Save:**
   - Click "SAVE"
   - Wait for confirmation

---

### Option 2: Direct IAM Page

1. **Go to IAM page:**
   ```
   https://console.cloud.google.com/iam-admin/iam?project=startege
   ```

2. **Click "GRANT ACCESS"** (top right)

3. **Add Principal:**
   ```
   startegizer-gemini@startege.iam.gserviceaccount.com
   ```

4. **Select Role:**
   - Search: `Vertex AI User`
   - Select: **Vertex AI User**

5. **Click "SAVE"**

---

## Verify Permissions

After granting access, verify:

1. Go back to IAM page
2. Find `startegizer-gemini@startege.iam.gserviceaccount.com`
3. Check that "Vertex AI User" role is listed

---

## Next Steps After Permissions

1. ✅ Enable Vertex AI API (if not done):
   ```
   https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=startege
   ```

2. ✅ Test integration:
   ```bash
   tsx scripts/test-gemini.ts
   ```

3. ✅ Test in dev server:
   ```bash
   npm run dev
   ```
   Navigate to `/startegizer` and test!

---

## Troubleshooting

### "Permission denied" error
- Verify role is assigned: Check IAM page
- Wait 1-2 minutes for propagation
- Ensure API is enabled

### "API not enabled" error
- Enable Vertex AI API in API Library
- Wait for activation (1-2 minutes)

---

**Quick Links:**
- IAM Page: https://console.cloud.google.com/iam-admin/iam?project=startege
- Vertex AI API: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=startege

