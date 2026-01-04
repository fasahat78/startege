# Prisma Cloud SQL Unix Socket Connection Format

## Correct Format (According to Prisma Documentation)

According to Prisma's official documentation, the correct format for Unix sockets is:

```
postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db
```

**Key Points:**
- **`@localhost` is REQUIRED** - While the value is ignored, its presence indicates to Prisma that a Unix socket connection is intended
- The `host` query parameter specifies the Unix socket directory path (`/cloudsql/PROJECT:REGION:INSTANCE`)
- The `localhost` hostname is ignored when the `host` parameter is present

## Why This Format?

From Prisma documentation:
> "The `@localhost` part is required. While the value is ignored, its presence indicates to Prisma that a Unix socket connection is intended."

## Update DATABASE_URL

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click `startege` → **"EDIT & DEPLOY NEW REVISION"**
3. Find `DATABASE_URL` environment variable
4. **Set to**:
   ```
   postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db
   ```
5. **Important**: Use `@localhost/` (NOT `@/`)
6. Click **"DEPLOY"**

## Critical: Verify Cloud SQL Connection in Cloud Run

If Prisma is appending `:5432` to the Unix socket path, the issue is likely that **Cloud SQL connection is not properly configured** in Cloud Run:

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click `startege` → **"EDIT & DEPLOY NEW REVISION"**
3. Go to **"Connections"** tab
4. Under **"Cloud SQL connections"**, ensure `startege-db` is listed
5. If not listed, click **"+ ADD CLOUD SQL CONNECTION"**
6. Select `startege-db` instance
7. Click **"DEPLOY"**

## Important Notes

- **USE `localhost`** - Required by Prisma for Unix socket mode (value is ignored)
- **DO NOT use empty host (`@/`)** - This can cause parsing issues
- The `host` parameter value (`/cloudsql/...`) is the Unix socket directory path
- Cloud SQL connection MUST be configured in Cloud Run for Unix sockets to work

## Verify After Update

After deployment, check Cloud Run logs for `[PRISMA]` messages:
- Should show: `Has /cloudsql/: true`
- Should show: `Has host parameter: true`
- Should show: `✅ Correct format: localhost with Unix socket host parameter`
- Database connection should work

## Troubleshooting

### If Prisma Appends `:5432` to Socket Path

**Cause**: Cloud SQL connection not configured in Cloud Run.

**Fix**: Add Cloud SQL connection in Cloud Run (see "Critical" section above).

### If Still Getting Connection Errors

1. Verify Cloud SQL instance has **Private IP** enabled
2. Verify Cloud Run service account has **Cloud SQL Client** role
3. Try adding `sslmode=require`:
   ```
   postgresql://postgres:Zoya%4057Bruce@localhost/startege?host=/cloudsql/startege:us-central1:startege-db&sslmode=require
   ```

## References

- [Prisma PostgreSQL Connection URLs](https://www.prisma.io/docs/orm/reference/connection-urls)
- [Google Cloud SQL Connect from Cloud Run](https://cloud.google.com/sql/docs/postgres/connect-run)
- The `localhost` hostname is ignored when `host` parameter specifies Unix socket path

