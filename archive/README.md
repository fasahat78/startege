# Archive Directory

This directory contains archived files that are no longer needed for the current production CI/CD pipeline.

## Contents

### `scripts/` - Archived Scripts

- **migration-scripts/** - Old migration scripts (superseded by automated Cloud Build migrations)
- **sql/** - Manual SQL scripts (superseded by Prisma migrations)

### `docs/` - Archived Documentation

- Old migration guides (superseded by `docs/PRODUCTION_DEPLOYMENT_GUIDE.md`)
- Troubleshooting docs (kept for reference)
- Superseded deployment guides

## Why Archived?

These files were used for manual database migrations and deployment processes. With the new automated CI/CD pipeline:

- ✅ Migrations run automatically via Cloud Build
- ✅ No manual SQL scripts needed
- ✅ All migrations tracked in Git via Prisma
- ✅ Production-safe `prisma migrate deploy` process

## Current Workflow

See `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` for the current automated deployment process.

## Can I Delete These?

Yes, but we recommend keeping them for:
- Historical reference
- Troubleshooting similar issues
- Understanding the evolution of the deployment process

If you need to free up space, you can safely delete this archive directory.

