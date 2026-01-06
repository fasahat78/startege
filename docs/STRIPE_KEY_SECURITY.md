# Stripe Secret Key Security

## ⚠️ IMPORTANT: Secret Key Exposed

Your Stripe LIVE secret key was shared in chat. **You should rotate it immediately.**

## Steps to Rotate Secret Key

### Step 1: Create New Secret Key

1. Go to: https://dashboard.stripe.com/apikeys
2. **Switch to LIVE mode** (toggle in top right)
3. Click **"Create secret key"**
4. **Copy the new key** (starts with `sk_live_...`)
5. **Don't delete the old key yet** (keep it until new one is working)

### Step 2: Update Cloud Run Environment Variable

1. Go to: https://console.cloud.google.com/run/detail/us-central1/startege/variables-and-secrets?project=startege
2. Find `STRIPE_SECRET_KEY`
3. Click **Edit**
4. Replace with the **new secret key**
5. Click **Save**
6. Cloud Run will restart automatically

### Step 3: Verify It Works

1. Try making a test purchase (or use Stripe Dashboard test webhook)
2. Check Cloud Run logs for any authentication errors
3. If everything works, proceed to Step 4

### Step 4: Delete Old Key

1. Go back to: https://dashboard.stripe.com/apikeys
2. Find the **old secret key** (the one that was exposed)
3. Click **"..."** → **"Delete"**
4. Confirm deletion

## Key Format Verification

### Valid Formats:

- **LIVE mode**: `sk_live_...` (51+ characters)
- **TEST mode**: `sk_test_...` (51+ characters)

### Your Key:

- ✅ Starts with `sk_live_` (correct for LIVE mode)
- ✅ Format looks valid
- ⚠️ **But it was exposed** - rotate it!

## Best Practices

1. **Never share secret keys** in chat, email, or public places
2. **Use environment variables** - never hardcode in code
3. **Rotate keys** if accidentally exposed
4. **Use different keys** for test vs live environments
5. **Monitor usage** in Stripe Dashboard for suspicious activity

## Current Status

- ✅ Key format is correct
- ✅ Key is LIVE mode (`sk_live_`)
- ⚠️ **Key was exposed** - should be rotated
- ✅ Key should be set in Cloud Run as `STRIPE_SECRET_KEY`

