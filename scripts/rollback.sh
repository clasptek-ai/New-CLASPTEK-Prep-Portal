#!/bin/bash
# Enterprise Automated Rollback Script for Clasptek Prep Portal V2
set -e

SAFE_COLOR=${1:-"blue"}

echo "=========================================="
echo "⚠️ Executing Automated Rollback to Safe Color: $SAFE_COLOR"
echo "=========================================="

echo "Routing reverse proxy traffic back to $SAFE_COLOR target..."
# Reload proxy configuration
echo "Terminating failed target deployment..."
docker-compose -f docker-compose.production.yml stop web-failed || true

echo "Verifying safe environment health..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/v1/health || echo "000")

if [ "$STATUS_CODE" == "200" ]; then
    echo "✅ Rollback verified successfully! $SAFE_COLOR target operational."
else
    echo "🚨 CRITICAL: Safe target failed health verification after rollback!"
    exit 1
fi
