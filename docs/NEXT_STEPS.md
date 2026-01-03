# Next Steps - Port 5433 Configuration

## ✅ Current Status

- **Server**: Startege ✅
- **Port**: 5433 ✅ (correct - avoiding conflict with port 5432)
- **Status**: Running ✅
- **Databases visible**: fasahatferoze, postgres, template1

## 📝 Step 1: Create the Database

You have two options:

### Option A: Create New Database "startege" (Recommended)

**Using PostgreSQL GUI:**
1. Click "Connect..." on your Startege server
2. Look for "Create Database" or right-click → "New Database"
3. Name it: `startege` (lowercase)
4. Use default settings

**Using Terminal:**
```bash
psql -h localhost -p 5433 -U postgres -c "CREATE DATABASE startege;"
```

### Option B: Use Existing Database

If you prefer, you can use the existing `fasahatferoze` database. Just update the `.env` file accordingly.

## 🔧 Step 2: Update .env File

I've created a `.env` file for you. **You need to update it with:**

1. **Your PostgreSQL username** (likely `postgres` or `fasahatferoze`)
2. **Your PostgreSQL password**

Edit `.env` and replace:
- `postgres` with your actual username (if different)
- `YOUR_PASSWORD` with your actual password

**Example:**
```bash
# If your username is "postgres" and password is "mypassword123"
DATABASE_URL="postgresql://postgres:mypassword123@localhost:5433/startege?schema=public"
```

## ✅ Step 3: Test Connection

After updating `.env`, test the connection:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push
```

**Expected output:**
```
✔ Generated Prisma Client
✔ Database schema pushed successfully
```

## 📥 Step 4: Import Concept Cards

Once the database is set up, import your concept cards:

```bash
npm run import:concepts
```

This will import all concepts from `AIGP_concepts_wix_clean.csv`.

## 🎯 Step 5: Start Development

```bash
npm run dev
```

Visit `http://localhost:3000` to see your app!

## 🐛 Troubleshooting

### "Password authentication failed"
- Check your username/password in `.env`
- Try using `postgres` as username
- Verify password in PostgreSQL app settings

### "Database does not exist"
- Make sure you created the `startege` database
- Or update `.env` to use an existing database name

### "Connection refused"
- Verify server is running (green checkmark)
- Check port is 5433 (not 5432)
- Test: `lsof -i :5433`

### "Role does not exist"
- Your username might be different
- Try `fasahatferoze` as username (your macOS username)
- Or check PostgreSQL app for the correct username

## 📊 Quick Checklist

- [ ] Database `startege` created (or using existing)
- [ ] `.env` file updated with correct username/password
- [ ] `npm run db:generate` successful
- [ ] `npm run db:push` successful
- [ ] `npm run import:concepts` successful
- [ ] `npm run dev` starts without errors

---

**You're almost there!** Just need to create the database and update credentials. 🚀

