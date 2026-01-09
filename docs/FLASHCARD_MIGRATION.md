# Flashcard Data Migration Guide

## Overview
This guide explains how to transfer flashcard data from JSON files to the database.

## Steps

### 1. Update Database Schema
Run Prisma migration to add the `AIGPFlashcard` model:

```bash
npx prisma migrate dev --name add_flashcard_model
```

Or if you prefer to create the migration manually:
```bash
npx prisma db push
```

### 2. Import Flashcards to Database

Run the import script:

```bash
npm run import-flashcards
```

Or directly:
```bash
npx tsx scripts/import-flashcards.ts
```

### 3. Verify Import

Check the database:
```sql
SELECT COUNT(*) FROM "AIGPFlashcard";
SELECT domain, COUNT(*) FROM "AIGPFlashcard" GROUP BY domain;
```

### 4. Test API

The API route will automatically use the database if flashcards exist there, otherwise it falls back to JSON files.

## Notes

- The script will update existing flashcards if they already exist (based on `flashcardId`)
- Only ACTIVE flashcards are imported
- The API route checks the database first, then falls back to JSON files
- This allows for a gradual migration without breaking existing functionality
