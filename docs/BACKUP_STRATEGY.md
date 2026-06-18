# PatronFlow Backup Strategy

## Overview

This document outlines the backup and disaster recovery strategy for PatronFlow's production environment.

## Supabase Backups

### Automatic Backups (Supabase Pro Plan)

Supabase provides automatic backups with the following characteristics:

| Feature | Free Plan | Pro Plan |
|---------|-----------|----------|
| Daily Backups | No | Yes |
| Retention | N/A | 7 days |
| Point-in-Time Recovery | No | Yes |

**Recommendation**: Use Supabase Pro plan for production to enable automatic daily backups.

### Enabling Backups

1. Upgrade to Supabase Pro plan in your project dashboard
2. Navigate to **Settings > Database > Backups**
3. Verify daily backups are enabled
4. Configure backup retention period if needed

### Point-in-Time Recovery (PITR)

With PITR enabled on Pro plan:
- Recover to any point within the retention period
- Minimum recovery granularity: 1 second
- Access via Supabase dashboard or support request

## Manual Backup Procedures

### Database Backup (pg_dump)

For additional backup security, perform manual backups:

```bash
# Set environment variables
export PGHOST=db.your-project.supabase.co
export PGPORT=5432
export PGDATABASE=postgres
export PGUSER=postgres
export PGPASSWORD=your-database-password

# Full database backup
pg_dump -Fc -f patronflow_backup_$(date +%Y%m%d).dump

# Schema only backup
pg_dump --schema-only -f patronflow_schema_$(date +%Y%m%d).sql

# Data only backup
pg_dump --data-only -f patronflow_data_$(date +%Y%m%d).sql
```

### Storage Backup

For the `logos` storage bucket:

```bash
# Using Supabase CLI
supabase storage download logos --output ./backup/logos/

# Or using the Supabase dashboard
# Navigate to Storage > logos > Download all
```

### Recommended Backup Schedule

| Backup Type | Frequency | Retention | Location |
|-------------|-----------|-----------|----------|
| Supabase Auto | Daily | 7 days | Supabase |
| Manual pg_dump | Weekly | 30 days | External storage |
| Storage bucket | Weekly | 30 days | External storage |

## Restore Procedures

### Restoring from Supabase Backup

1. Navigate to Supabase dashboard
2. Go to **Settings > Database > Backups**
3. Select the backup date/time
4. Click "Restore" and confirm
5. Wait for restoration (may take several minutes)

### Restoring from Manual Backup

```bash
# Restore full database
pg_restore -d postgres patronflow_backup_20260617.dump

# Restore schema only
psql -d postgres -f patronflow_schema_20260617.sql

# Restore data only
psql -d postgres -f patronflow_data_20260617.sql
```

### Restoring Storage

```bash
# Using Supabase CLI
supabase storage upload logos ./backup/logos/ --upsert
```

## Disaster Recovery Plan

### Recovery Time Objective (RTO)

- **Target**: 4 hours
- **Maximum acceptable**: 24 hours

### Recovery Point Objective (RPO)

- **Target**: 24 hours (daily backups)
- **With PITR**: Minutes

### Recovery Steps

1. **Assess the Situation**
   - Identify the scope of data loss
   - Determine the recovery point needed

2. **Notify Stakeholders**
   - Inform team of the incident
   - Set expectations for recovery time

3. **Restore Database**
   - Use PITR if available and recent
   - Otherwise, restore from latest daily backup

4. **Restore Storage**
   - Restore logos and images from backup

5. **Verify Data Integrity**
   - Run integrity checks
   - Verify critical data is present

6. **Resume Service**
   - Clear any caches
   - Verify application functionality
   - Monitor for issues

## Backup Monitoring

### Health Checks

- [ ] Daily backup completed (check Supabase dashboard)
- [ ] Weekly manual backup completed
- [ ] Backup files are accessible
- [ ] Test restore completed (monthly)

### Alerts

Configure alerts for:
- Failed backup notifications
- Storage quota approaching limit
- Database size changes (unusual growth)

### Monthly Test Restore

Perform a test restore monthly to ensure:
1. Backup files are valid
2. Restore process works
3. Data integrity is maintained
4. Team is familiar with the process

## Security Considerations

1. **Encrypt backups** at rest and in transit
2. **Restrict access** to backup files
3. **Store backups** in a different region/provider
4. **Rotate credentials** used for backup access
5. **Audit access** to backup systems

## Contact

For backup-related emergencies:
- Primary: [Your email]
- Secondary: Supabase support
