# Migration Scripts Cleanup Guide

This document lists migration-related scripts that are no longer needed now that migrations are automated in Cloud Build.

## Scripts to Keep

These scripts are still useful for development and troubleshooting:

- `scripts/run-migrations-with-proxy.sh` - Useful for local testing
- `scripts/run-migrations-direct.sh` - Useful for emergency manual migrations
- `scripts/setup-cloud-build-permissions.sh` - One-time setup script

## Scripts to Archive/Remove

These scripts were used for manual migrations and are no longer needed:

### Cloud Build Migration Scripts (No longer needed)
- `cloudbuild-migrations.yaml` - Migrations now run in main cloudbuild.yaml
- `scripts/run-migrations-cloud-build.sh` - No longer needed
- `scripts/create-migration-job.sh` - Cloud Run job approach deprecated

### Manual SQL Scripts (Keep for reference, but not needed)
- `scripts/create-user-profile-table.sql` - Use Prisma migrations instead
- `scripts/complete-schema.sql` - Use Prisma migrations instead
- `scripts/complete-schema-idempotent.sql` - Use Prisma migrations instead
- `scripts/complete-schema-fully-idempotent.sql` - Use Prisma migrations instead
- `scripts/complete-schema-clean.sql` - Use Prisma migrations instead
- `scripts/create-missing-objects-only.sql` - Use Prisma migrations instead
- `scripts/apply-complete-schema.sql` - Use Prisma migrations instead
- `scripts/apply-complete-schema-safe.sql` - Use Prisma migrations instead

### Documentation (Archive, keep for reference)
- `docs/RUN_MIGRATIONS_CLOUD_SQL.md` - Manual process, now automated
- `docs/RUN_MIGRATIONS_CLOUD_RUN_JOB.md` - Deprecated approach
- `docs/RUN_MIGRATIONS_MANUAL.md` - Manual process, now automated
- `docs/CLOUD_BUILD_MIGRATION_SETUP.md` - Superseded by PRODUCTION_DEPLOYMENT_GUIDE.md
- `docs/FIX_CLOUD_BUILD_MIGRATIONS.md` - Troubleshooting, keep for reference
- `docs/ADD_MIGRATION_VARIABLES_TO_TRIGGER.md` - Superseded by PRODUCTION_DEPLOYMENT_GUIDE.md
- `docs/MIGRATION_STRATEGY.md` - Old strategy, now automated
- `docs/APPLY_COMPLETE_SCHEMA.md` - Manual process, now automated
- `docs/EXTRACT_AND_APPLY_SCHEMA.md` - Manual process, now automated

## Cleanup Steps

1. **Archive old scripts** (don't delete, move to `scripts/archive/`):
   ```bash
   mkdir -p scripts/archive
   mv cloudbuild-migrations.yaml scripts/archive/
   mv scripts/run-migrations-cloud-build.sh scripts/archive/
   mv scripts/create-migration-job.sh scripts/archive/
   ```

2. **Archive SQL scripts** (keep for reference):
   ```bash
   mkdir -p scripts/archive/sql
   mv scripts/*.sql scripts/archive/sql/
   # Keep only essential ones if needed
   ```

3. **Update documentation**:
   - Keep `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` as the main guide
   - Archive old migration docs to `docs/archive/`

## New Workflow

**Before (Manual)**:
1. Make schema changes
2. Create migration locally
3. Manually run SQL scripts in Cloud SQL Studio
4. Deploy application

**After (Automated)**:
1. Make schema changes
2. Create migration locally: `npx prisma migrate dev --name migration_name`
3. Commit and push
4. Cloud Build automatically:
   - Runs migrations
   - Builds application
   - Deploys to production

## Benefits

✅ **No manual SQL scripts** - Everything through Prisma migrations
✅ **Automated** - Migrations run automatically on every deployment
✅ **Safe** - Uses `prisma migrate deploy` (production-safe)
✅ **Versioned** - All migrations tracked in Git
✅ **Idempotent** - Safe to run multiple times
✅ **Consistent** - Same process for all environments

