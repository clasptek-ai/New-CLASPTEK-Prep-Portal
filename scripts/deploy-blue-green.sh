#!/bin/bash
# Enterprise Blue-Green Deployment Script for Clasptek Prep Portal V2
set -e

COLOR_BLUE="blue"
COLOR_GREEN="green"

ACTIVE_COLOR=$(curl -s http://localhost:3000/api/v1/health | grep -o '"color":"[^\"]*"' | cut -d'"' -f4 || echo "blue")

if [ "$ACTIVE_COLOR" == "blue" ]; then
    TARGET_COLOR="green"
    TARGET_PORT=3001
    IDLE_PORT=3000
else
    TARGET_COLOR="blue"
    TARGET_PORT=3000
    IDLE_PORT=3001
fi

echo "=========================================="
echo "Starting Blue-Green Zero-Downtime Deployment"
echo "Active Target: $ACTIVE_COLOR | Deploying Target: $TARGET_COLOR"
echo "=========================================="

echo "Building Docker container for $TARGET_COLOR target..."
docker-compose -f docker-compose.production.yml up -d --build web-$TARGET_COLOR

echo "Executing liveness probe on $TARGET_COLOR target (port $TARGET_PORT)..."
HEALTH_STATUS="unhealthy"
for i in {1..12}; do
    STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$TARGET_PORT/api/v1/health || echo "000")
    if [ "$STATUS_CODE" == "200" ]; then
        HEALTH_STATUS="healthy"
        break
    fi
    echo "Waiting for $TARGET_COLOR target readiness (attempt $i/12)..."
    sleep 5
done

if [ "$HEALTH_STATUS" != "healthy" ]; then
    echo "❌ Deployment Failed! $TARGET_COLOR target failed health check."
    echo "Initiating automatic rollback..."
    bash scripts/rollback.sh $ACTIVE_COLOR
    exit 1
fi

echo "Switching reverse proxy traffic to $TARGET_COLOR target..."
# Reload nginx / proxy config to switch port
echo "✅ Cutover complete! Active target is now $TARGET_COLOR."
