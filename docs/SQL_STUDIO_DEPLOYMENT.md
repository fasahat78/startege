# Deploying via SQL Studio - Simple Guide

## ✅ Why This Works

- You're already comfortable with SQL Studio
- No migration history issues
- Direct control over what gets created
- Same approach you used for AIGP tables

## 🚀 Steps

### Step 1: Open Cloud SQL Studio

1. Go to: https://console.cloud.google.com/sql/instances
2. Click on your database instance: `startege-db`
3. Click "Open Cloud SQL Studio" (or use the SQL tab)

### Step 2: Run the SQL Script

1. Open the file: `scripts/create-flashcards-admin-discounts-tables.sql`
2. Copy the entire contents
3. Paste into SQL Studio
4. Click "Run" or press Cmd+Enter

### Step 3: Verify

The script includes verification queries at the end. You should see:
- ✅ 3 tables listed (AIGPFlashcardProgress, DiscountCode, DiscountCodeUsage)
- ✅ 5 enums listed (FlashcardStatus, DiscountCodeType, etc.)
- ✅ 2 columns in User table (isAdmin, role)

### Step 4: Create Admin User (Optional)

After tables are created, run:

```sql
UPDATE "User" SET "isAdmin" = true, "role" = 'ADMIN' WHERE email = 'fasahat@gmail.com';
```

### Step 5: Regenerate Prisma Client

After creating tables, regenerate Prisma Client so your code can use them:

```bash
cd /Users/fasahatferoze/Desktop/Startege
npx prisma generate
```

## ✅ That's It!

After running the SQL script:
1. ✅ Tables are created
2. ✅ Prisma Client regenerated
3. ✅ Your code will work!

## 🔍 What Gets Created

- **AIGPFlashcardProgress** - Tracks user flashcard progress
- **FlashcardStatus** enum - NOT_STARTED, REVIEWING, MASTERED
- **DiscountCode** - Stores discount codes
- **DiscountCodeUsage** - Tracks code usage
- **User.isAdmin** - Boolean flag for admin access
- **User.role** - UserRole enum (USER, ADMIN, MODERATOR)

## ⚠️ Important Notes

- The script uses `IF NOT EXISTS` so it's safe to run multiple times
- If something already exists, it won't error
- Foreign keys are created with CASCADE delete (safe)
- All indexes are created for performance

## 🐛 Troubleshooting

**"Type already exists"**
- That's OK! The enum already exists, script will skip it

**"Table already exists"**
- That's OK! The script checks before creating

**"Column already exists"**
- That's OK! The script checks before adding columns

The script is designed to be idempotent (safe to run multiple times).

