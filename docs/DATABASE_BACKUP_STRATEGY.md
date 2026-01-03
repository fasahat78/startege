# Database Backup Strategy

**Last Updated**: 2025-01-XX

## Overview

This document outlines the backup strategy for the Startege PostgreSQL database hosted on Google Cloud SQL.

## Backup Configuration

### Automated Backups (Recommended)

Google Cloud SQL provides automated backup functionality:

1. **Enable Automated Backups**
   - Navigate to Google Cloud Console → SQL → Your Instance
   - Enable "Automated backups"
   - Set backup window (recommended: 2-4 AM UTC)
   - Retention period: 7 days (default) or 30 days (recommended for production)

2. **Backup Settings**
   ```
   Backup Window: 02:00-04:00 UTC (low traffic period)
   Retention: 30 days
   Point-in-time Recovery: Enabled
   ```

### Manual Backups

#### Using `pg_dump` (Local Development)

```bash
# Full database backup
pg_dump -h localhost -p 5433 -U your_username -d startege > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup specific tables only
pg_dump -h localhost -p 5433 -U your_username -d startege -t "User" -t "Exam" > partial_backup.sql

# Compressed backup
pg_dump -h localhost -p 5433 -U your_username -d startege | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Using Google Cloud SQL

```bash
# Create manual backup via gcloud CLI
gcloud sql backups create \
  --instance=your-instance-name \
  --description="Manual backup before migration"

# List backups
gcloud sql backups list --instance=your-instance-name

# Restore from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance=your-instance-name \
  --restore-instance=your-instance-name
```

#### Using Prisma Studio (Development)

1. Open Prisma Studio: `npm run db:studio`
2. Export data manually for specific tables (not recommended for production)

## Backup Schedule

### Production Environment

- **Automated Daily Backups**: Enabled via Google Cloud SQL
  - Time: 02:00 UTC (configurable)
  - Retention: 30 days
  - Point-in-time recovery: Enabled

- **Manual Backups**: Before major changes
  - Before schema migrations
  - Before data migrations
  - Before bulk data operations
  - Weekly full backup (in addition to automated)

### Development Environment

- **Manual Backups**: As needed
  - Before testing migrations
  - Before major data changes

## Backup Verification

### Test Restore Procedure

1. **Create test instance**:
   ```bash
   gcloud sql instances create startege-test \
     --database-version=POSTGRES_15 \
     --tier=db-f1-micro \
     --region=us-central1
   ```

2. **Restore backup to test instance**:
   ```bash
   gcloud sql backups restore BACKUP_ID \
     --backup-instance=startege-prod \
     --restore-instance=startege-test
   ```

3. **Verify data integrity**:
   - Check record counts
   - Verify critical tables
   - Test application connectivity

### Automated Verification Script

Create `scripts/verify-backup.ts`:

```typescript
// Verify backup integrity
// Check table counts, data consistency, etc.
```

## Disaster Recovery Plan

### Recovery Time Objective (RTO)
- **Target**: < 4 hours
- **Maximum**: < 24 hours

### Recovery Point Objective (RPO)
- **Target**: < 1 hour (point-in-time recovery)
- **Maximum**: < 24 hours (daily backups)

### Recovery Steps

1. **Assess damage**
   - Identify affected tables/data
   - Determine backup point needed

2. **Restore from backup**
   - Use Google Cloud SQL restore feature
   - Or restore to new instance and migrate

3. **Verify restoration**
   - Check data integrity
   - Test application functionality

4. **Update application**
   - Point application to restored database
   - Monitor for issues

## Backup Storage

### Google Cloud SQL Backups
- Stored automatically in Google Cloud Storage
- Encrypted at rest
- Redundant across multiple zones

### Manual Backups
- Store in secure location (encrypted)
- Consider Google Cloud Storage bucket
- Keep off-site copies for critical data

## Monitoring

### Backup Status Monitoring

Set up alerts for:
- Failed automated backups
- Backup age (ensure recent backups exist)
- Backup size anomalies

### Google Cloud Monitoring

```bash
# Set up alerting policy for backup failures
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="Database Backup Failure" \
  --condition-display-name="Backup failed" \
  --condition-threshold-value=1
```

## Best Practices

1. **Test backups regularly**: Restore to test environment monthly
2. **Document restore procedures**: Keep runbook updated
3. **Monitor backup success**: Set up alerts
4. **Encrypt backups**: Ensure encryption at rest
5. **Off-site backups**: Keep copies in different region
6. **Version control**: Track schema changes in Prisma migrations
7. **Point-in-time recovery**: Enable for production databases

## Emergency Contacts

- **Database Administrator**: [Contact Info]
- **Google Cloud Support**: [Support Plan Details]
- **On-call Engineer**: [Contact Info]

## Related Documentation

- [Prisma Migrations Guide](./PRISMA_MIGRATIONS.md)
- [Google Cloud SQL Documentation](https://cloud.google.com/sql/docs/postgres)
- [Disaster Recovery Plan](./DISASTER_RECOVERY.md)

