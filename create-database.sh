#!/bin/bash
# Script to create startege database using full psql path

PSQL_PATH="/Applications/Postgres.app/Contents/Versions/18/bin/psql"

echo "Creating database 'startege' on port 5433..."
echo "Note: You'll be prompted for your PostgreSQL password"

$PSQL_PATH -h localhost -p 5433 -U postgres -c "CREATE DATABASE startege;"

if [ $? -eq 0 ]; then
    echo "✅ Database 'startege' created successfully!"
else
    echo "❌ Failed to create database. Check your username/password."
    echo ""
    echo "Alternative: Use your PostgreSQL GUI app to create the database."
fi

