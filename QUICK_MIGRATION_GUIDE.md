# Quick Migration Guide - 3 Simple Steps

## ✅ Good News!
- ✅ Cloud SQL Proxy is already running
- ✅ Google Cloud SDK is installed
- ✅ You're authenticated

## 🚀 Run Migrations in 3 Steps

### Step 1: Set Database Password

Open your terminal and run (replace `YOUR_PASSWORD` with your actual password):

```bash
export DATABASE_URL='postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/startege'
```

**Example:**
```bash
export DATABASE_URL='postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5432/startege'
```

> **Note:** If your password contains special characters, URL-encode them:
> - `@` becomes `%40`
> - `#` becomes `%23`
> - etc.

### Step 2: Run Migrations

```bash
cd /Users/fasahatferoze/Desktop/Startege
npx prisma migrate deploy
```

You should see:
```
✅ Applied migration: add_flashcards_admin_discounts
```

### Step 3: Verify (Optional)

```bash
npx prisma migrate status
```

Should show: `Database schema is up to date`

## 🎉 Done!

That's it! Your database is now ready for the new features.

## 📋 What Gets Created

- ✅ `AIGPFlashcardProgress` table
- ✅ `FlashcardStatus` enum  
- ✅ `DiscountCode` table
- ✅ `DiscountCodeUsage` table
- ✅ `User.isAdmin` column
- ✅ `User.role` column

## 🔍 Troubleshooting

**"Connection refused"**
- Make sure Cloud SQL Proxy is running
- Check: `pgrep -f cloud-sql-proxy`

**"Authentication failed"**
- Double-check your password
- Make sure special characters are URL-encoded

**"Migration already applied"**
- That's OK! It means you're already done ✅

## 💡 Alternative: Use the Interactive Script

If you prefer step-by-step guidance:

```bash
./scripts/run-migrations-simple.sh
```

This script will:
- Check everything is set up
- Prompt you for password securely
- Run migrations automatically
- Verify everything worked

