# Diagnosing 500 Internal Server Error

## Current Status
- ✅ Next.js v16.0.10 installed
- ✅ Prisma client generated
- ✅ Database connection works
- ❌ Even `/api/test` (simplest endpoint) returns 500

## Critical: We Need Terminal Output

The browser only shows "500 Internal Server Error" but **the terminal shows the actual error**.

### Steps to Get the Error:

1. **Open your terminal** where `npm run dev` is running
2. **Clear the terminal** (Cmd+K on Mac)
3. **Visit** `http://localhost:3000/api/test` in your browser
4. **Watch the terminal** - an error message will appear
5. **Copy the ENTIRE error message** and share it

### What to Look For:

The error will likely be one of these:

```
Error: Cannot find module '@/lib/...'
```
→ Module resolution issue

```
PrismaClient is not configured
```
→ Prisma setup issue

```
SyntaxError: Unexpected token
```
→ Syntax error in a file

```
TypeError: Cannot read property '...' of undefined
```
→ Runtime error

## Quick Fixes to Try:

### 1. Full Clean Restart
```bash
# Stop server (Ctrl+C)
rm -rf .next
rm -rf node_modules/.cache
npm run dev
```

### 2. Reinstall Dependencies
```bash
rm -rf node_modules
npm install
npm run db:generate
npm run dev
```

### 3. Check Port Conflict
```bash
# Make sure port 3000 is free
lsof -ti:3000 | xargs kill -9
npm run dev
```

## Next Steps

Once you share the terminal error message, I can provide the exact fix.

