#!/bin/bash

# Enhanced Database backup script for production
# This script creates daily backups and manages retention

# Exit on error
set -e

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
DB_NAME="${POSTGRES_DB}"
DB_USER="${POSTGRES_USER}"
DB_HOST="db"

# Create backup directory structure
DAILY_DIR="$BACKUP_DIR/daily"
WEEKLY_DIR="$BACKUP_DIR/weekly"
MONTHLY_DIR="$BACKUP_DIR/monthly"

mkdir -p $DAILY_DIR
mkdir -p $WEEKLY_DIR
mkdir -p $MONTHLY_DIR

# Get day of week (0-6, 0 is Sunday) and day of month (1-31)
DOW=$(date +%w)
DOM=$(date +%d)

# Timestamp
echo "=== Starting backup of database $DB_NAME at $(date) ==="

# Create the backup file
BACKUP_FILE="$DAILY_DIR/db_backup_$DATE.sql.gz"
echo "Creating backup: $BACKUP_FILE"
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_FILE

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "✓ Backup completed successfully: $BACKUP_FILE"
    
    # Create weekly backup on Sundays (day 0)
    if [ "$DOW" = "0" ]; then
        cp $BACKUP_FILE "$WEEKLY_DIR/db_backup_week_$(date +%U)_$DATE.sql.gz"
        echo "✓ Weekly backup created"
    fi
    
    # Create monthly backup on the 1st of the month
    if [ "$DOM" = "01" ]; then
        cp $BACKUP_FILE "$MONTHLY_DIR/db_backup_month_$(date +%m)_$DATE.sql.gz"
        echo "✓ Monthly backup created"
    fi
    
    # Retention: Daily backups - keep for 7 days
    echo "Cleaning up old backups..."
    find $DAILY_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
    
    # Retention: Weekly backups - keep for 5 weeks
    find $WEEKLY_DIR -name "db_backup_week_*.sql.gz" -mtime +35 -delete
    
    # Retention: Monthly backups - keep for 12 months
    find $MONTHLY_DIR -name "db_backup_month_*.sql.gz" -mtime +365 -delete
    
    echo "✓ Old backups removed according to retention policy"
    echo "=== Backup process completed at $(date) ==="
    
    # Report statistics
    TOTAL_SIZE=$(du -sh $BACKUP_DIR | cut -f1)
    echo "Total backup size: $TOTAL_SIZE"
    echo "Daily backups: $(ls $DAILY_DIR | wc -l)"
    echo "Weekly backups: $(ls $WEEKLY_DIR | wc -l)"
    echo "Monthly backups: $(ls $MONTHLY_DIR | wc -l)"
else
    echo "✗ BACKUP FAILED!" >&2
    exit 1
fi
