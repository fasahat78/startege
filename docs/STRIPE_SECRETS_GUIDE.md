# Stripe Secrets Organization Guide

## Stripe Variables Breakdown

### 🔒 Secrets (Use GCP Secrets Manager)

These are **sensitive** and must be kept secret:

1. **`STRIPE_SECRET_KEY`**
   - **Why secret**: Private API key for server-side operations
   - **GCP Secret**: `startege-stripe-secret-key`
   - **Used for**: Creating charges, managing customers, server-side operations
   - **Never expose**: Must never be in client-side code

2. **`STRIPE_WEBHOOK_SECRET`**
   - **Why secret**: Used to verify webhook signatures
   - **GCP Secret**: `startege-stripe-webhook-secret`
   - **Used for**: Verifying webhook authenticity
   - **Never expose**: Must never be in client-side code

### 🌐 Public Variables (Use Regular Environment Variables)

These are **safe to expose** (public or not sensitive):

1. **`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`**
   - **Why public**: Designed to be exposed in client-side code
   - **Regular env var**: Yes
   - **Used for**: Client-side Stripe.js initialization
   - **Safe to expose**: Yes, this is the publishable key

2. **`STRIPE_PRICE_MONTHLY`**
   - **Why not secret**: Just a price ID (e.g., `price_1234567890`)
   - **Regular env var**: Yes
   - **Used for**: Identifying which Stripe price to use
   - **Safe to expose**: Yes, price IDs are not sensitive

3. **`STRIPE_PRICE_ANNUAL`**
   - **Why not secret**: Just a price ID
   - **Regular env var**: Yes
   - **Safe to expose**: Yes

4. **`STRIPE_PRICE_LIFETIME`**
   - **Why not secret**: Just a price ID
   - **Regular env var**: Yes
   - **Safe to expose**: Yes

5. **`STRIPE_PRICE_CREDITS_SMALL`**
   - **Why not secret**: Just a price ID
   - **Regular env var**: Yes
   - **Safe to expose**: Yes

6. **`STRIPE_PRICE_CREDITS_STANDARD`**
   - **Why not secret**: Just a price ID
   - **Regular env var**: Yes
   - **Safe to expose**: Yes

7. **`STRIPE_PRICE_CREDITS_LARGE`**
   - **Why not secret**: Just a price ID
   - **Regular env var**: Yes
   - **Safe to expose**: Yes

## Summary

### GCP Secrets Manager (2 secrets):
- ✅ `startege-stripe-secret-key` → `STRIPE_SECRET_KEY`
- ✅ `startege-stripe-webhook-secret` → `STRIPE_WEBHOOK_SECRET`

**Cost**: ~$0.12/month (2 secrets × $0.06)

### Regular Environment Variables (7 variables):
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_PRICE_MONTHLY`
- ✅ `STRIPE_PRICE_ANNUAL`
- ✅ `STRIPE_PRICE_LIFETIME`
- ✅ `STRIPE_PRICE_CREDITS_SMALL`
- ✅ `STRIPE_PRICE_CREDITS_STANDARD`
- ✅ `STRIPE_PRICE_CREDITS_LARGE`

**Cost**: $0/month

## Why Price IDs Are Not Secrets

Stripe price IDs (like `price_1234567890`) are:
- ✅ Public identifiers
- ✅ Used in client-side code
- ✅ Visible in browser network requests
- ✅ Not sensitive information
- ✅ Safe to expose

**However**: They're still useful to configure as environment variables for:
- Easy updates without code changes
- Different prices for different environments (dev/staging/prod)
- Configuration management

## Setup Instructions

### Step 1: Create Secrets in GCP Secrets Manager

1. Go to: https://console.cloud.google.com/security/secret-manager
2. Create **`startege-stripe-secret-key`**:
   - Value: Your Stripe secret key (starts with `sk_`)
3. Create **`startege-stripe-webhook-secret`**:
   - Value: Your Stripe webhook signing secret (starts with `whsec_`)

### Step 2: Configure Cloud Run

1. Go to Cloud Run → Your service → Edit
2. **Variables & Secrets** tab

**Secrets Section** (use Secrets Manager):
- Add Secret Variable:
  - Name: `STRIPE_SECRET_KEY`
  - Secret: `startege-stripe-secret-key`
  - Version: `latest`
- Add Secret Variable:
  - Name: `STRIPE_WEBHOOK_SECRET`
  - Secret: `startege-stripe-webhook-secret`
  - Version: `latest`

**Variables Section** (regular env vars):
- Add Variable: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_...`
- Add Variable: `STRIPE_PRICE_MONTHLY` = `price_...`
- Add Variable: `STRIPE_PRICE_ANNUAL` = `price_...`
- Add Variable: `STRIPE_PRICE_LIFETIME` = `price_...`
- Add Variable: `STRIPE_PRICE_CREDITS_SMALL` = `price_...`
- Add Variable: `STRIPE_PRICE_CREDITS_STANDARD` = `price_...`
- Add Variable: `STRIPE_PRICE_CREDITS_LARGE` = `price_...`

## Quick Reference

| Variable | Type | Storage | Cost |
|----------|------|---------|------|
| `STRIPE_SECRET_KEY` | Secret | GCP Secrets Manager | $0.06/month |
| `STRIPE_WEBHOOK_SECRET` | Secret | GCP Secrets Manager | $0.06/month |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Public | Regular Env Var | $0 |
| `STRIPE_PRICE_*` (all 5) | Not Secret | Regular Env Var | $0 |

**Total Cost**: ~$0.12/month (only 2 secrets)

## Security Best Practices

1. ✅ **Never commit** Stripe secret keys to git
2. ✅ **Never expose** `STRIPE_SECRET_KEY` in client-side code
3. ✅ **Always verify** webhook signatures using `STRIPE_WEBHOOK_SECRET`
4. ✅ **Use environment variables** for all Stripe configuration
5. ✅ **Rotate secrets** if compromised (easy with Secrets Manager)

