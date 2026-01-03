# Billing Setup for Vertex AI

## Why Billing is Required

Even though Vertex AI Studio works without billing, the **Vertex AI SDK requires billing to be enabled** to access Gemini models programmatically.

## Enable Billing

### Step 1: Go to Billing Page
```
https://console.cloud.google.com/billing?project=startege
```

### Step 2: Link Billing Account
1. If you have a billing account:
   - Click "Link a billing account"
   - Select your billing account
   - Click "Set account"

2. If you don't have a billing account:
   - Click "Create billing account"
   - Fill in payment information
   - Link to project

### Step 3: Wait for Propagation
- Wait 2-3 minutes after enabling billing
- APIs need time to recognize billing status

### Step 4: Test Again
```bash
npx tsx scripts/test-gemini.ts
```

## Free Tier Information

**Gemini Free Tier (as of 2024):**
- **Input**: 15 requests per minute (RPM)
- **Output**: 15 requests per minute (RPM)
- **No cost** for free tier usage

**Pricing After Free Tier:**
- Gemini Pro: ~$0.000125 per 1K input tokens, ~$0.0005 per 1K output tokens
- Very affordable for development/testing

## Verify Billing Status

Check billing status:
```
https://console.cloud.google.com/billing?project=startege
```

Should show:
- ✅ Billing account linked
- ✅ Status: Active

## Troubleshooting

### "Billing account not found"
- Create a new billing account
- Add payment method
- Link to project

### "Billing disabled"
- Re-enable billing
- Wait for propagation

### Still getting 404 after enabling billing
- Wait 3-5 minutes
- Verify billing account is active
- Check API status in dashboard

---

**Once billing is enabled, Gemini will work!** 🎯

