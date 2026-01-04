# Run Prisma Migrations on Cloud SQL

## The Problem

Connection is working, but the error `The table public.User does not exist` means the database schema hasn't been migrated yet.

## Solution: Run Prisma Migrations

You have migrations in `prisma/migrations/` that need to be applied to Cloud SQL.

---

## Option 1: Run Migrations Locally (If Cloud SQL Has Public IP)

If you enabled Public IP on Cloud SQL and can connect from your local machine:

### Step 1: Set DATABASE_URL Locally

Create/update `.env.local` with your Cloud SQL connection string:

```bash
DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@YOUR_CLOUD_SQL_PUBLIC_IP:5432/startege?sslmode=require"
```

**To get your Cloud SQL Public IP:**
1. Go to: https://console.cloud.google.com/sql/instances/startege-db?project=startege
2. Look under **"IP addresses"** → **"Public IP"**
3. Replace `YOUR_CLOUD_SQL_PUBLIC_IP` with that IP

**Important**: You may need to add your local IP to Cloud SQL's **"Authorized networks"**:
1. Cloud SQL → `startege-db` → **"Connections"** → **"Authorized networks"**
2. Click **"+ ADD NETWORK"**
3. Add your current IP (or use `0.0.0.0/0` for testing - **NOT recommended for production**)

### Step 2: Run Migrations

```bash
# Apply all pending migrations
npx prisma migrate deploy

# Or if you want to create a new migration first:
npx prisma migrate dev
```

---

## Option 2: Run Migrations via Cloud Build Job (Recommended for Production)

This runs migrations as part of your deployment pipeline.

### Step 1: Create Migration Script

Create `scripts/run-migrations.ts`:

```typescript
import { execSync } from 'child_process';

console.log('🚀 Running Prisma migrations...');

try {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL,
    },
  });
  console.log('✅ Migrations completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
}
```

### Step 2: Add Migration Step to Cloud Build

Update `cloudbuild.yaml` to run migrations before deploying:

```yaml
steps:
  # ... existing build steps ...
  
  # Run migrations
  - name: 'node:20-alpine'
    entrypoint: 'sh'
    args:
      - '-c'
      - |
        npm install
        npx prisma generate
        npx prisma migrate deploy
    env:
      - 'DATABASE_URL=${_DATABASE_URL}'
    id: 'run-migrations'
    
  # ... rest of deployment steps ...
```

---

## Option 3: Run Migrations via Cloud Run Job (One-Time)

Create a Cloud Run job that runs migrations:

1. Go to: https://console.cloud.google.com/run/jobs?project=startege
2. Click **"CREATE JOB"**
3. Name: `startege-migrations`
4. Container image: Use a Node.js image with Prisma
5. Command: `npx prisma migrate deploy`
6. Environment variables:
   - `DATABASE_URL`: `postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db`
7. Cloud SQL connections: Add `startege-db`
8. Click **"CREATE"** then **"EXECUTE JOB"**

---

## Option 4: Quick Fix - Use `db push` (Development Only)

**⚠️ WARNING**: This syncs schema directly without migrations. Use only for development/testing.

```bash
# Set DATABASE_URL to Cloud SQL
export DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@YOUR_PUBLIC_IP:5432/startege?sslmode=require"

# Push schema (creates tables directly)
npx prisma db push
```

---

## Verify Migrations Applied

After running migrations, verify tables exist:

```bash
# Using Prisma Studio (if connected locally)
npx prisma studio

# Or check via SQL
psql "postgresql://postgres:Zoya%4057Bruce@YOUR_PUBLIC_IP:5432/startege?sslmode=require" -c "\dt"
```

You should see tables like:
- `User`
- `Challenge`
- `ConceptCard`
- `AIGPExam`
- etc.

---

## Recommended Approach

**For Production**: Use **Option 2** (Cloud Build) or **Option 3** (Cloud Run Job) to ensure migrations run automatically.

**For Quick Testing**: Use **Option 1** (local) if you have Cloud SQL Public IP access.

---

## Next Steps After Migrations

Once migrations are applied:
1. Verify connection works (no more "table does not exist" errors)
2. Seed initial data if needed (domains, categories, badges, etc.)
3. Test the application

