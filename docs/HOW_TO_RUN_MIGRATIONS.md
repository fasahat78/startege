# How to Run Database Migrations - Step by Step Guide

## Prerequisites

1. **Google Cloud SDK** installed (`gcloud` command)
2. **Cloud SQL Proxy** installed
3. **Production database password**

## Step-by-Step Instructions

### Step 1: Install Cloud SQL Proxy (if not already installed)

```bash
# On macOS
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.amd64
chmod +x cloud-sql-proxy
sudo mv cloud-sql-proxy /usr/local/bin/

# Verify installation
cloud-sql-proxy --version
```

### Step 2: Authenticate with Google Cloud

```bash
gcloud auth login
gcloud config set project startege
```

### Step 3: Start Cloud SQL Proxy

**Open Terminal 1** (keep this running):

```bash
cloud-sql-proxy startege:us-central1:startege-db --port=5432
```

You should see: `Ready for new connections`

**Keep this terminal open!**

### Step 4: Set Production Database URL

**Open Terminal 2** (new terminal):

```bash
# Navigate to project directory
cd /Users/fasahatferoze/Desktop/Startege

# Set production DATABASE_URL
# Replace YOUR_PASSWORD with your actual database password
export DATABASE_URL='postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/startege'

# Verify it's set
echo $DATABASE_URL
```

### Step 5: Run Migrations

**In Terminal 2** (same terminal where you set DATABASE_URL):

```bash
# Run migrations
npx prisma migrate deploy
```

You should see output like:
```
✅ Applied migration: add_flashcards_admin_discounts
```

### Step 6: Verify Migrations

```bash
# Check migration status
npx prisma migrate status
```

### Step 7: Create Admin User (Optional)

After migrations complete, create your admin user:

```bash
# Connect to database using psql (if you have it)
psql $DATABASE_URL

# Then run:
UPDATE "User" SET "isAdmin" = true, "role" = 'ADMIN' WHERE email = 'fasahat@gmail.com';

# Exit psql
\q
```

Or use Prisma Studio:
```bash
npx prisma studio
```

## Troubleshooting

### "Connection refused" error
- Make sure Cloud SQL Proxy is running in Terminal 1
- Check that port 5432 is not already in use

### "Authentication failed" error
- Verify your database password is correct
- Check that DATABASE_URL is set correctly

### "Migration already applied" error
- This is OK! It means migrations are already done
- Check status with: `npx prisma migrate status`

## Quick Reference

**Terminal 1** (keep running):
```bash
cloud-sql-proxy startege:us-central1:startege-db --port=5432
```

**Terminal 2**:
```bash
cd /Users/fasahatferoze/Desktop/Startege
export DATABASE_URL='postgresql://postgres:YOUR_PASSWORD@127.0.0.1:5432/startege'
npx prisma migrate deploy
```

