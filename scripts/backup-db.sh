#!/bin/bash

# Script to backup PostgreSQL database and optionally MongoDB

# Configuration
BACKUP_DIR="/opt/gamiprotocol/backups"
POSTGRES_CONTAINER="gami-protocol-db"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
POSTGRES_BACKUP_FILE="$BACKUP_DIR/postgres_$DATE.sql.gz"
MONGO_BACKUP_FILE="$BACKUP_DIR/mongo_$DATE.archive.gz"
RETAIN_DAYS=7  # Keep backups for 7 days

# Ensure backup directory exists
mkdir -p $BACKUP_DIR

echo "======= Gami Protocol Database Backup Script ======="
echo "Starting backup at $(date)"

# Backup PostgreSQL database
echo "[1/4] Backing up PostgreSQL database..."
docker exec $POSTGRES_CONTAINER pg_dump -U gami gamidb | gzip > $POSTGRES_BACKUP_FILE
if [ $? -eq 0 ]; then
    echo "PostgreSQL backup completed successfully: $POSTGRES_BACKUP_FILE"
else
    echo "Error: PostgreSQL backup failed!"
    exit 1
fi

# Backup MongoDB if available
if [ -n "$(docker ps -q -f name=gami-protocol-mongo)" ]; then
    echo "[2/4] Backing up MongoDB database..."
    docker exec gami-protocol-mongo mongodump --archive --gzip > $MONGO_BACKUP_FILE
    if [ $? -eq 0 ]; then
        echo "MongoDB backup completed successfully: $MONGO_BACKUP_FILE"
    else
        echo "Warning: MongoDB backup failed!"
    fi
else
    echo "[2/4] MongoDB container not found, skipping MongoDB backup."
fi

# Remove old backups
echo "[3/4] Cleaning up old backups (older than $RETAIN_DAYS days)..."
find $BACKUP_DIR -name "postgres_*.sql.gz" -mtime +$RETAIN_DAYS -delete
find $BACKUP_DIR -name "mongo_*.archive.gz" -mtime +$RETAIN_DAYS -delete

# Show backup info
echo "[4/4] Backup information:"
echo "Backup location: $BACKUP_DIR"
echo "PostgreSQL backup size: $(du -h $POSTGRES_BACKUP_FILE | cut -f1)"
if [ -f "$MONGO_BACKUP_FILE" ]; then
    echo "MongoDB backup size: $(du -h $MONGO_BACKUP_FILE | cut -f1)"
fi
echo "Total backup storage used: $(du -sh $BACKUP_DIR | cut -f1)"

echo "Backup completed at $(date)"
echo "======================================="

# Exit with success
exit 0