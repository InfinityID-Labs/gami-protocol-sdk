#!/bin/bash

# Script to clean up Docker resources

echo "======= Docker Cleanup Script ======="
echo "This script will clean up Docker resources to free up space."

# Remove unused containers
echo "[1/5] Removing unused containers..."
docker container prune -f

# Remove unused images
echo "[2/5] Removing unused images..."
docker image prune -f

# Remove dangling images (images without tags)
echo "[3/5] Removing dangling images..."
docker rmi $(docker images -f "dangling=true" -q) 2>/dev/null || echo "No dangling images to remove."

# Remove unused volumes
echo "[4/5] Removing unused volumes..."
docker volume prune -f

# Remove unused networks
echo "[5/5] Removing unused networks..."
docker network prune -f

# Show current disk usage
echo "======= Disk Usage ======="
df -h /

# Show current Docker disk usage
echo "======= Docker Disk Usage ======="
docker system df

echo "Cleanup complete!"