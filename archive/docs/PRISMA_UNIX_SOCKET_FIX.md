# Fix: Prisma Appending :5432 to Unix Socket Path

## The Problem

When using `localhost` in DATABASE_URL:
```
postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db
```

Prisma treats it as TCP and appends `:5432` to the Unix socket path:
```
Can't reach database server at `/cloudsql/startege:us-central1:startege-db:5432`
```

## The Solution

**Use empty host format** (`@/`) instead of `localhost`:

```
postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
```

## Why This Works

- Empty host (`@/`) tells Prisma to use **Unix socket mode**
- `localhost` makes Prisma use **TCP mode** and append `:5432`
- The `host` parameter specifies the Unix socket directory path

## Update DATABASE_URL in Cloud Run

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click `startege` → **"EDIT & DEPLOY NEW REVISION"**
3. Find `DATABASE_URL` environment variable
4. **Set to**:
   ```
   postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
   ```
5. **Important**: Use `@/` (empty host), NOT `@localhost/`
6. Click **"DEPLOY"**

## Verify After Update

After deployment, check Cloud Run logs for `[PRISMA]` messages:
- Should show: `Has empty host (@/): true`
- Should NOT show: `⚠️ WARNING: Contains localhost`
- Database connection should work

## If You Still Get "Empty Host" Error

If Prisma still reports "empty host" error with `@/` format, try adding `sslmode=require`:

```
postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db&sslmode=require
```

This ensures Prisma uses the correct connection mode.

