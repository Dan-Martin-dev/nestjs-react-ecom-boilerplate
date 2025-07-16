#!/bin/bash

# Database backup script for production

DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
DB_NAME="${POSTGRES_DB:-ecommerce}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_HOST="db"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
echo "Starting backup of database $DB_NAME at $(date)"
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully: db_backup_$DATE.sql.gz"
    
    # Remove backups older than 7 days
    find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +7 -delete
    echo "Old backups removed"
else
    echo "Backup failed!" >&2
    exit 1
fi
