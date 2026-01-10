#!/bin/bash
# Script to add refund columns to local Payment table

echo "Adding refund columns to Payment table..."

# Get database URL from .env
if [ -f .env.local ]; then
  DB_URL=$(grep "^DATABASE_URL=" .env.local | cut -d'=' -f2-)
elif [ -f .env ]; then
  DB_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2-)
else
  echo "Error: No .env or .env.local file found"
  exit 1
fi

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL not found in .env files"
  exit 1
fi

# Extract database name from URL
DB_NAME=$(echo $DB_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo "Database: $DB_NAME"
echo ""
echo "Run this SQL:"
echo ""
cat scripts/add-refund-columns-local.sql
echo ""
echo "Or connect with: psql $DB_NAME"
