#!/bin/bash
# Cleanup script for Startege project
# Archives old migration scripts and redundant documentation

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARCHIVE_DIR="$PROJECT_ROOT/archive"
DOCS_ARCHIVE="$ARCHIVE_DIR/docs"
SCRIPTS_ARCHIVE="$ARCHIVE_DIR/scripts"

echo "🧹 Starting project cleanup..."
echo "Project root: $PROJECT_ROOT"
echo ""

# Create archive directories
mkdir -p "$DOCS_ARCHIVE"
mkdir -p "$SCRIPTS_ARCHIVE/sql"
mkdir -p "$SCRIPTS_ARCHIVE/migration-scripts"

echo "📦 Archiving old migration-related files..."
echo ""

# Archive old Cloud Build migration files
if [ -f "$PROJECT_ROOT/cloudbuild-migrations.yaml" ]; then
    echo "  → Archiving cloudbuild-migrations.yaml"
    mv "$PROJECT_ROOT/cloudbuild-migrations.yaml" "$SCRIPTS_ARCHIVE/"
fi

# Archive old migration scripts
MIGRATION_SCRIPTS=(
    "run-migrations-cloud-build.sh"
    "run-migrations-cloud-sql.sh"
    "run-migrations-direct.sh"
    "run-migrations-with-proxy.sh"
    "create-migration-job.sh"
)

for script in "${MIGRATION_SCRIPTS[@]}"; do
    if [ -f "$PROJECT_ROOT/scripts/$script" ]; then
        echo "  → Archiving scripts/$script"
        mv "$PROJECT_ROOT/scripts/$script" "$SCRIPTS_ARCHIVE/migration-scripts/"
    fi
done

# Archive SQL migration scripts (keep for reference)
SQL_SCRIPTS=(
    "complete-schema.sql"
    "complete-schema-idempotent.sql"
    "complete-schema-fully-idempotent.sql"
    "complete-schema-clean.sql"
    "create-user-profile-table.sql"
    "create-missing-objects-only.sql"
    "apply-complete-schema.sql"
    "apply-complete-schema-safe.sql"
    "extract-current-schema.sql"
    "fix-user-table.sql"
    "fix-user-table-complete.sql"
    "fix-emailVerified-type.sql"
    "check-user-table-schema.sql"
    "grant-permissions.sql"
    "fix-all-permissions.sql"
    "check-and-fix-permissions.sql"
    "diagnose-permissions.sql"
    "quick-test-migrations.sql"
    "test-migrations.sql"
)

for script in "${SQL_SCRIPTS[@]}"; do
    if [ -f "$PROJECT_ROOT/scripts/$script" ]; then
        echo "  → Archiving scripts/$script"
        mv "$PROJECT_ROOT/scripts/$script" "$SCRIPTS_ARCHIVE/sql/"
    fi
done

# Archive old migration documentation
MIGRATION_DOCS=(
    "RUN_MIGRATIONS_CLOUD_SQL.md"
    "RUN_MIGRATIONS_CLOUD_RUN_JOB.md"
    "RUN_MIGRATIONS_MANUAL.md"
    "CLOUD_BUILD_MIGRATION_SETUP.md"
    "ADD_MIGRATION_VARIABLES_TO_TRIGGER.md"
    "FIX_CLOUD_BUILD_MIGRATIONS.md"
    "MIGRATION_STRATEGY.md"
    "APPLY_COMPLETE_SCHEMA.md"
    "EXTRACT_AND_APPLY_SCHEMA.md"
    "CREATE_USER_PROFILE_TABLE.md"
)

for doc in "${MIGRATION_DOCS[@]}"; do
    if [ -f "$PROJECT_ROOT/docs/$doc" ]; then
        echo "  → Archiving docs/$doc"
        mv "$PROJECT_ROOT/docs/$doc" "$DOCS_ARCHIVE/"
    fi
done

# Archive old troubleshooting docs (keep some, archive others)
TROUBLESHOOTING_DOCS=(
    "FIX_DATABASE_URL_TRUNCATED.md"
    "FIX_DATABASE_URL_ERROR.md"
    "PRISMA_UNIX_SOCKET_FORMAT.md"
    "PRISMA_UNIX_SOCKET_FIX.md"
    "CORRECT_DATABASE_URL_FORMAT.md"
    "ADD_AUTHORIZED_NETWORK.md"
    "DIAGNOSTIC_RESULTS.md"
    "FINAL_DIAGNOSTIC_SUMMARY.md"
    "RUN_DIAGNOSTIC.md"
    "VERIFY_DATABASE_CONNECTION.md"
    "CHECK_CLOUD_RUN_LOGS.md"
    "CHECK_SECRET_LOADING.md"
)

for doc in "${TROUBLESHOOTING_DOCS[@]}"; do
    if [ -f "$PROJECT_ROOT/docs/$doc" ]; then
        echo "  → Archiving docs/$doc"
        mv "$PROJECT_ROOT/docs/$doc" "$DOCS_ARCHIVE/"
    fi
done

# Archive old Firebase troubleshooting docs
FIREBASE_DOCS=(
    "FIREBASE_KEY_VERIFICATION_CHECKLIST.md"
    "VERIFY_OR_REGENERATE_FIREBASE_API_KEY.md"
    "DEBUG_FIREBASE_IN_CLOUD_RUN.md"
)

for doc in "${FIREBASE_DOCS[@]}"; do
    if [ -f "$PROJECT_ROOT/docs/$doc" ]; then
        echo "  → Archiving docs/$doc"
        mv "$PROJECT_ROOT/docs/$doc" "$DOCS_ARCHIVE/"
    fi
done

# Archive old setup/deployment docs that are superseded
SUPERSEDED_DOCS=(
    "GCP_DEPLOYMENT.md"
    "PRODUCTION_DEPLOYMENT.md"
    "DEPLOY_ACTUAL_CODE.md"
)

for doc in "${SUPERSEDED_DOCS[@]}"; do
    if [ -f "$PROJECT_ROOT/docs/$doc" ]; then
        echo "  → Archiving docs/$doc (superseded by PRODUCTION_DEPLOYMENT_GUIDE.md)"
        mv "$PROJECT_ROOT/docs/$doc" "$DOCS_ARCHIVE/"
    fi
done

# Remove root-level temporary files
ROOT_TEMP_FILES=(
    "RUN_MIGRATIONS_NOW.md"
    "migration_preview.sql"
)

for file in "${ROOT_TEMP_FILES[@]}"; do
    if [ -f "$PROJECT_ROOT/$file" ]; then
        echo "  → Removing $file"
        rm "$PROJECT_ROOT/$file"
    fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Summary:"
echo "  - Archived migration scripts → archive/scripts/"
echo "  - Archived SQL scripts → archive/scripts/sql/"
echo "  - Archived old docs → archive/docs/"
echo "  - Removed temporary files"
echo ""
echo "📁 Archive location: $ARCHIVE_DIR"
echo ""
echo "💡 Note: Archived files are kept for reference but are no longer needed"
echo "   for the automated CI/CD pipeline."

