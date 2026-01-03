# Database Setup Guide

## ✅ Server Configuration (You've Done This!)

Your PostgreSQL server is configured correctly:
- **Server Name**: Startege ✅
- **Version**: PostgreSQL 18 ✅
- **Port**: 5433 ✅ (using 5433 because 5432 was already in use)
- **Status**: Running ✅

## 📝 Next Steps: Create the Database

After creating the server, you need to create the actual **database** within it.

### Option 1: Using PostgreSQL GUI (Recommended)

1. In your PostgreSQL app, connect to the "Startege" server
2. Look for a "Create Database" or "New Database" option
3. Create a database named: `startege` (lowercase)
4. Use default settings (no need to change anything)

### Option 2: Using Terminal

```bash
# Connect to PostgreSQL (using port 5433)
psql -h localhost -p 5433 -U postgres

# Or if you have a specific user:
psql -h localhost -p 5433 -U your_username

# Create the database
CREATE DATABASE startege;

# Exit psql
\q
```

### Option 3: Using psql Command Line

```bash
createdb -h localhost -p 5433 startege
```

## 🔧 Configure Your .env File

Once the database is created, create a `.env` file in your project root:

```bash
# Database Connection
# Format: postgresql://username:password@host:port/database_name
DATABASE_URL="postgresql://postgres:your_password@localhost:5433/startege?schema=public"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Environment
NODE_ENV="development"
```

### Finding Your Username

- **Default username**: Usually `postgres` or your macOS username
- **Password**: The one you set when installing PostgreSQL, or check your PostgreSQL app settings

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

Copy the output and paste it as your `NEXTAUTH_SECRET` value.

## ✅ Verify Connection

After setting up `.env`, test the connection:

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database (this will test the connection)
npm run db:push
```

If successful, you'll see:
```
✔ Generated Prisma Client
✔ Database schema pushed successfully
```

## 🐛 Troubleshooting

### "Database does not exist"
- Make sure you created the database (not just the server)
- Check the database name matches in `.env`

### "Password authentication failed"
- Verify your username and password in `DATABASE_URL`
- Check PostgreSQL app settings for credentials

### "Connection refused"
- Make sure PostgreSQL server is running
- Verify port 5433 is correct (you're using 5433, not 5432)
- Check if server is listening: `lsof -i :5433`

### "Role does not exist"
- Your username might be different
- Try using `postgres` as username
- Or create a user: `CREATE USER your_username WITH PASSWORD 'your_password';`

## 📊 After Database is Ready

Once connected, you can:

1. **Import concept cards**:
   ```bash
   npm run import:concepts
   ```

2. **View database**:
   ```bash
   npm run db:studio
   ```

3. **Start development**:
   ```bash
   npm run dev
   ```

---

**Your server config is perfect!** Just need to create the database now. 🚀

