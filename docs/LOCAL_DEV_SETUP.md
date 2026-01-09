# Local Development Setup

## Database Connection

For local development, you need to connect to your production Cloud SQL database via Cloud SQL Proxy.

### 1. Start Cloud SQL Proxy

```bash
cloud-sql-proxy startege:us-central1:startege-db --port=5435
```

### 2. Set DATABASE_URL in .env.local

```bash
DATABASE_URL="postgresql://postgres:Zoya%4057Bruce@127.0.0.1:5435/startege"
```

**Important**: Use `127.0.0.1:5435` (Cloud SQL Proxy), NOT the Unix socket format (`/cloudsql/...`).

### 3. Firebase Configuration

Make sure `.env.local` contains all Firebase variables:

```bash
# Firebase Client SDK
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCQet-j6HonZZioU8ip9W6g0apsRC_bats
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=startege.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=startege
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=startege.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=785373873454
NEXT_PUBLIC_FIREBASE_APP_ID=1:785373873454:web:ea2aa58440389c78eda6bf

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'
FIREBASE_PROJECT_ID=startege
```

### 4. Restart Dev Server

After making changes to `.env.local`:

1. **Kill all Next.js processes**:
   ```bash
   pkill -f "next dev"
   ```

2. **Clear Next.js cache**:
   ```bash
   rm -rf .next
   ```

3. **Regenerate Prisma client** (if schema changed):
   ```bash
   npx prisma generate
   ```

4. **Start dev server**:
   ```bash
   npm run dev
   ```

## Troubleshooting

### "Can't reach database server at `/cloudsql/...`"

This means Prisma is trying to use the Cloud Run Unix socket format. Fix:

1. Verify `.env.local` has the correct DATABASE_URL (with `127.0.0.1:5435`)
2. Clear `.next` cache: `rm -rf .next`
3. Regenerate Prisma: `rm -rf node_modules/.prisma && npx prisma generate`
4. Restart dev server completely

### "Firebase Admin SDK not configured"

Make sure `.env.local` has `FIREBASE_SERVICE_ACCOUNT_KEY` and `FIREBASE_PROJECT_ID`.

### "NEXT_PUBLIC_FIREBASE_API_KEY is not set"

Make sure all `NEXT_PUBLIC_*` variables are in `.env.local` (not just `.env`).

## Environment File Priority

Next.js loads environment variables in this order (later files override earlier):
1. `.env`
2. `.env.local` ← **Use this for local overrides**
3. `.env.development`
4. `.env.development.local`

For local development, put your overrides in `.env.local`.

