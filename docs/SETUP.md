# Setup Guide - Startege MVP

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- npm or yarn package manager

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/startege?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-key-here"

# App
NODE_ENV="development"
```

**Important**: Generate a secure secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 3. Set Up Database

#### Option A: Local PostgreSQL

1. Install PostgreSQL if not already installed
2. Create a database:
```bash
createdb startege
```
3. Update `DATABASE_URL` in `.env` with your credentials

#### Option B: Cloud SQL (Production)

Use Google Cloud SQL PostgreSQL instance and update `DATABASE_URL` accordingly.

### 4. Run Prisma Migrations

```bash
# Generate Prisma Client
npm run db:generate

# Push schema to database
npm run db:push
```

### 5. Import Concept Cards Data

```bash
# Run the import script
npm run import:concepts
```

Or manually:
```bash
npx tsx scripts/import-concepts.ts
```

### 6. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma Client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Create and run migrations
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
startege/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth routes (to be created)
│   ├── (dashboard)/       # Protected routes (to be created)
│   ├── api/               # API routes (to be created)
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components (to be created)
├── lib/                   # Utilities
│   └── db.ts             # Prisma client
├── prisma/               # Prisma schema & migrations
│   └── schema.prisma     # Database schema
├── scripts/              # Utility scripts
│   └── import-concepts.ts # CSV import script (to be created)
└── public/               # Static assets
```

## Next Steps

1. ✅ Project structure set up
2. ⏭️ Create CSV import script
3. ⏭️ Set up authentication
4. ⏭️ Build concept cards UI
5. ⏭️ Implement gamification

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running
- Check `DATABASE_URL` format in `.env`
- Ensure database exists
- Check user permissions

### Prisma Issues

- Run `npm run db:generate` after schema changes
- Clear `.next` folder if build issues occur
- Check Prisma logs for detailed errors

### Port Already in Use

Change the port:
```bash
npm run dev -- -p 3001
```

## Development Tips

- Use Prisma Studio to view database: `npm run db:studio`
- Check browser console for client-side errors
- Check terminal for server-side errors
- Use TypeScript for type safety

