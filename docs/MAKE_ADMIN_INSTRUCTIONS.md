# Making fasahat@gmail.com an Admin

The database schema needs to be updated first to add the `isAdmin` and `role` columns. Here are two options:

## Option 1: Run SQL Script in Cloud SQL Studio (Recommended)

1. Go to [Cloud SQL Studio](https://console.cloud.google.com/sql/instances/startege-db/databases?project=startege)
2. Click on your database (`startege`)
3. Click "Query" tab
4. Copy and paste the contents of `scripts/add-admin-columns.sql`
5. Click "Run"
6. Verify the output shows `isAdmin: true` and `role: ADMIN`

## Option 2: Run Prisma Migration

If you want to add all the new schema changes (discount codes, early adopters, etc.):

```bash
# This will add all new columns and tables
npx prisma db push --accept-data-loss

# Then run the make-admin script
npx tsx scripts/make-admin.ts fasahat@gmail.com
```

## Option 3: Manual SQL Update (if columns already exist)

If the columns already exist, you can just run:

```sql
UPDATE "User" 
SET "isAdmin" = true, role = 'ADMIN'
WHERE email = 'fasahat@gmail.com';
```

## Verification

After running the update, verify with:

```sql
SELECT email, name, "isAdmin", role 
FROM "User" 
WHERE email = 'fasahat@gmail.com';
```

You should see:
- `isAdmin: true`
- `role: ADMIN`

Then you can access the admin dashboard at `/admin`!

