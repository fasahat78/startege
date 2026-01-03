# Stripe Configuration Files

This folder contains Stripe product and price exports for both Test and Live modes.

---

## 📁 Files

### Test Mode (Development)
- `prices_test.csv` - Test mode price IDs and configurations
- `products_test.csv` - Test mode product details and metadata

### Live Mode (Production)
- `prices_live.csv` - Live mode price IDs and configurations
- `products_live.csv` - Live mode product details and metadata

---

## 🔑 Test Mode Price IDs (Current)

### Subscriptions
- **Monthly**: `price_1SjgjVBEA7DCjdkmBtlbXixO` - $19.00/month
- **Annual**: `price_1SjgkBBEA7DCjdkmBNNuD71Q` - $199.00/year

### AI Credits
- **Small**: `price_1SjgkdBEA7DCjdkmmMe9NPl4` - $5.00
- **Standard**: `price_1SjgmIBEA7DCjdkmN4L3A4xu` - $10.00
- **Large**: `price_1SjgopBEA7DCjdkmIxPQ9Usj` - $25.00

---

## 📋 Metadata Verification

All credit products have correct metadata:

### Small Credits
- `purchasePrice`: `500` (cents)
- `apiUsageCredits`: `250` (cents)
- `bundle`: `small`
- `type`: `credit_topup`

### Standard Credits
- `purchasePrice`: `1000` (cents)
- `apiUsageCredits`: `500` (cents)
- `bundle`: `standard`
- `type`: `credit_topup`

### Large Credits
- `purchasePrice`: `2500` (cents)
- `apiUsageCredits`: `1500` (cents)
- `bundle`: `large`
- `bonus`: `20%`
- `type`: `credit_topup`

---

## 🔄 Usage

### Development
- Use Test Mode price IDs from `prices_test.csv`
- Configure in `.env.local` with test mode keys

### Production
- Use Live Mode price IDs from `prices_live.csv`
- Configure in production environment with live mode keys

---

## 📝 Notes

- Test and Live modes are completely separate
- Price IDs are different between test and live modes
- Always test in Test Mode before deploying to production
- Keep both CSV files updated when products change

---

**Last Updated**: 2025-12-29

