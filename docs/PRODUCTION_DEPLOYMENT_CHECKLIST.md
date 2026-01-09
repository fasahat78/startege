# Production Deployment Checklist

## 🎯 New Features Being Deployed

1. **AIGP Flashcards System**
   - Flashcard progress tracking (`AIGPFlashcardProgress` model)
   - FlashcardStatus enum
   - Flashcards API routes (`/api/aigp-exams/flashcards/*`)
   - FlashcardsTab component
   - Flashcard component with flip animation

2. **Admin Dashboard**
   - Admin authentication (`isAdmin`, `role` fields)
   - Admin layout and pages
   - Admin API routes (`/api/admin/*`)
   - Admin components

3. **Discount Code System**
   - `DiscountCode` model
   - `DiscountCodeUsage` model
   - Discount code API routes
   - Discount verification and application logic

4. **Early Adopter Tracking**
   - Early adopter tier tracking
   - Admin early adopter management

## ✅ Pre-Deployment Checklist

### 1. Code Verification
- [x] All new features tested locally
- [x] Flashcards working correctly
- [x] Admin dashboard accessible
- [x] Discount codes functional
- [x] No TypeScript errors
- [x] No linting errors

### 2. Database Schema Changes
- [x] `AIGPFlashcardProgress` model added
- [x] `FlashcardStatus` enum created
- [x] `DiscountCode` model exists
- [x] `DiscountCodeUsage` model exists
- [x] `User.isAdmin` field exists
- [x] `User.role` field exists
- [x] Schema pushed to local database successfully
- [ ] **TODO: Run migrations on production database**

### 3. Prisma Client
- [x] Prisma Client regenerated locally
- [x] Enum types available in generated client
- [ ] **TODO: Ensure Prisma Client regenerates during Cloud Build**

### 4. Environment Variables
Verify these are set in GCP Secret Manager:
- [ ] `DATABASE_URL` (production Cloud SQL)
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY`
- [ ] `FIREBASE_PROJECT_ID`
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY`
- [ ] `STRIPE_SECRET_KEY` (LIVE mode)
- [ ] `STRIPE_PUBLISHABLE_KEY` (LIVE mode)
- [ ] `STRIPE_WEBHOOK_SECRET` (LIVE mode)
- [ ] Stripe Price IDs (LIVE mode)

### 5. File Assets
- [x] Flashcard JSON files exist in `AIGP Flash Cards/` directory
- [ ] **TODO: Verify flashcard files are included in Docker image**

### 6. API Routes
- [x] `/api/aigp-exams/flashcards` - GET flashcards
- [x] `/api/aigp-exams/flashcards/progress` - GET/POST progress
- [x] `/api/aigp-exams/flashcards/stats` - GET stats
- [x] `/api/admin/*` - Admin routes
- [x] `/api/discount-codes/*` - Discount code routes

## 🚀 Deployment Steps

### Step 1: Database Migration
**CRITICAL: Run migrations before deploying code**

```bash
# Option 1: Using Cloud SQL Proxy (recommended for safety)
# Connect to production database and run:
npx prisma migrate deploy

# Option 2: Using Cloud Build migration job (if configured)
# This should run automatically if cloudbuild-migrations.yaml exists
```

**Migration Commands:**
```bash
# Generate migration for new schema changes
npx prisma migrate dev --name add_flashcards_admin_discounts --create-only

# Review the generated migration SQL
cat prisma/migrations/[timestamp]_add_flashcards_admin_discounts/migration.sql

# Deploy to production
npx prisma migrate deploy
```

### Step 2: Verify Production Database
After migration, verify:
- [ ] `AIGPFlashcardProgress` table exists
- [ ] `FlashcardStatus` enum type exists
- [ ] `DiscountCode` table exists
- [ ] `DiscountCodeUsage` table exists
- [ ] `User` table has `isAdmin` and `role` columns
- [ ] All indexes created correctly

### Step 3: Code Deployment
```bash
# Commit all changes
git add .
git commit -m "feat: Add flashcards, admin dashboard, and discount codes"

# Push to repository
git push origin main

# Cloud Build will automatically trigger
# Monitor build at: https://console.cloud.google.com/cloud-build/builds
```

### Step 4: Post-Deployment Verification

#### 4.1 Admin Access
- [ ] Admin user exists in production database (`isAdmin = true`)
- [ ] Admin dashboard accessible at `/admin`
- [ ] Admin API routes working (`/api/admin/*`)

#### 4.2 Flashcards
- [ ] Flashcards load correctly (`/aigp-exams` → Flashcards tab)
- [ ] Progress tracking works (click "Got It" / "Need Review")
- [ ] Stats display correctly
- [ ] Filters work (domain, card type, priority, study mode)

#### 4.3 Discount Codes
- [ ] Discount codes can be created via admin
- [ ] Discount codes can be applied at checkout
- [ ] Discount verification works
- [ ] Usage tracking works

#### 4.4 General Functionality
- [ ] Existing features still work (concepts, challenges, exams)
- [ ] Authentication works
- [ ] Stripe payments work
- [ ] No console errors

## 🔍 Rollback Plan

If deployment fails:

1. **Database Rollback:**
   ```bash
   # Revert last migration
   npx prisma migrate resolve --rolled-back [migration_name]
   ```

2. **Code Rollback:**
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main
   ```

3. **Cloud Run Rollback:**
   - Go to Cloud Run console
   - Select previous revision
   - Click "Manage Traffic"
   - Set previous revision to 100% traffic

## 📝 Post-Deployment Tasks

1. **Create Admin User:**
   ```sql
   UPDATE "User" SET "isAdmin" = true, "role" = 'ADMIN' WHERE email = 'fasahat@gmail.com';
   ```

2. **Create Sample Discount Codes (if needed):**
   - Use admin dashboard at `/admin/discount-codes`
   - Or run SQL script if available

3. **Monitor Logs:**
   - Check Cloud Run logs for errors
   - Monitor API response times
   - Check database connection pool usage

4. **Test Critical Paths:**
   - User signup/login
   - Premium subscription purchase
   - Discount code application
   - Flashcard usage
   - Admin dashboard access

## ⚠️ Important Notes

1. **Database Migrations MUST run before code deployment** - The new code expects the new tables/enums to exist.

2. **Prisma Client Regeneration** - Cloud Build should regenerate Prisma Client during build. Verify this happens.

3. **Flashcard Files** - Ensure `AIGP Flash Cards/` directory is included in Docker image (should be by default).

4. **Environment Variables** - Double-check all production environment variables are set correctly, especially Stripe LIVE keys.

5. **Admin Access** - After deployment, ensure admin user exists in production database.

6. **Testing** - Test in production with a test account before announcing to users.

## 🐛 Troubleshooting

### If flashcards don't load:
- Check Cloud Run logs for file read errors
- Verify `AIGP Flash Cards/` directory exists in container
- Check file permissions

### If admin dashboard doesn't work:
- Verify `isAdmin` is set in production database
- Check admin API routes are accessible
- Verify Firebase authentication works

### If discount codes don't work:
- Check Stripe webhook is configured correctly
- Verify discount code tables exist
- Check discount verification API route

### If database errors occur:
- Verify migrations ran successfully
- Check DATABASE_URL is correct
- Verify Cloud SQL connection

