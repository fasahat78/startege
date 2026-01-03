# DATABASE_URL Configuration

## Your Cloud SQL Details

- **Connection Name**: `startege:us-central1:startege-db`
- **Password**: `Zoya@57Bruce`
- **Database Name**: `startege` (as configured)
- **Username**: `postgres` (default PostgreSQL username)

## DATABASE_URL Format

For Cloud SQL with Private IP, use this format:

```
postgresql://USERNAME:PASSWORD@/DATABASE_NAME?host=/cloudsql/CONNECTION_NAME
```

## Your DATABASE_URL

**Important**: The password contains special characters (`@`) that need to be URL-encoded.

### Option 1: With URL-encoded password (Recommended)

```
postgresql://postgres:Zoya%4057Bruce@/startege?host=/cloudsql/startege:us-central1:startege-db
```

**Note**: `@` is encoded as `%40`

### Option 2: If your username is different

If you created a different username during Cloud SQL setup, replace `postgres` with your actual username.

## How to Find Your Username

1. Go to Cloud SQL Console: https://console.cloud.google.com/sql/instances
2. Click on your instance: `startege-db`
3. Go to **"Users"** tab
4. Check the username (usually `postgres`)

## Adding to GitHub Secrets

1. Go to: https://github.com/fasahat78/startege/settings/secrets/actions
2. Click **"New repository secret"**
3. **Name**: `DATABASE_URL`
4. **Value**: Paste the DATABASE_URL from above
5. Click **"Add secret"**

## Verification

After adding the secret, verify:
- Secret name: `DATABASE_URL`
- Value starts with: `postgresql://`
- Contains: `/cloudsql/startege:us-central1:startege-db`
- Password is URL-encoded (if it contains special characters)

## Troubleshooting

### Password Contains Special Characters

If your password has special characters like `@`, `#`, `$`, `%`, etc., they need to be URL-encoded:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

### Connection Issues

If you have connection issues:
1. Verify the connection name is correct: `startege:us-central1:startege-db`
2. Check that Cloud Run has the Cloud SQL connection added
3. Verify the database name: `startege`
4. Confirm the username is correct

