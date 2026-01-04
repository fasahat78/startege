# How to Check Cloud Run Logs for Database Errors

## The Log Entry You Shared

The log shows:
- **Endpoint**: `/api/auth/firebase/verify`
- **Status**: 500 (Server Error)
- **Response size**: 886 bytes
- **Issue**: `payload: "payloadNotSet"` - the actual error message isn't shown

## Get the Actual Error Message

### Method 1: Cloud Console (Easiest)

1. Go to: https://console.cloud.google.com/run?project=startege
2. Click on `startege` service
3. Click **"Logs"** tab
4. **Filter by**:
   - `severity>=ERROR`
   - Or search for: `PRISMA` or `DATABASE_URL` or `empty host`
5. Look for logs with **actual error messages** (not just request logs)

### Method 2: Check Application Logs (Not Request Logs)

The log you shared is a **request log**. We need **application logs** which show the actual error.

In Cloud Console Logs:
- **Filter by**: `resource.type=cloud_run_revision`
- **Look for**: Logs with `textPayload` or `jsonPayload.message`
- **Search for**: `PRISMA`, `DATABASE_URL`, `empty host`, `Invalid prisma`

### Method 3: Check Recent Errors

Look for logs around the same timestamp (`2026-01-04T10:01:02`) that show:
- `[PRISMA]` - Our diagnostic logging
- `Invalid prisma.user.findUnique()` - The actual Prisma error
- `empty host` - The specific error message

## What to Look For

After the new deployment (with our logging), you should see:

### If Secret is Loaded:
```
[PRISMA] DATABASE_URL present: {
  length: 89,
  startsWith: "postgresql://postgres:",
  hasCloudSql: true,
  hasEmptyHost: true,
  ...
}
```

### If Secret is NOT Loaded:
```
[PRISMA] ❌ DATABASE_URL is not set!
```

### If Prisma Fails to Parse:
```
Invalid `prisma.user.findUnique()` invocation:
The provided database string is invalid. Error parsing connection string: empty host in database URL.
```

## Next Steps

1. **Wait for new deployment** (with our logging) - should be deploying now
2. **Check logs again** - look for `[PRISMA]` messages
3. **Share the actual error message** - not just the request log, but the application log with the error details

The request log you shared doesn't show the actual error - we need the application log that contains the Prisma error message.

