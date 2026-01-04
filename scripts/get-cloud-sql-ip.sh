#!/bin/bash

# Get Cloud SQL Public IP
echo "🔍 Getting Cloud SQL Public IP..."

IP=$(gcloud sql instances describe startege-db --project=startege --format="value(ipAddresses[0].ipAddress)" 2>/dev/null)

if [ -z "$IP" ]; then
    echo "❌ Could not get IP automatically"
    echo ""
    echo "Please get it manually from:"
    echo "  https://console.cloud.google.com/sql/instances/startege-db?project=startege"
    echo ""
    echo "Then set it as:"
    echo "  export CLOUD_SQL_PUBLIC_IP='YOUR_IP_HERE'"
    exit 1
fi

echo "✅ Found Public IP: $IP"
export CLOUD_SQL_PUBLIC_IP="$IP"
echo "export CLOUD_SQL_PUBLIC_IP='$IP'" >> /tmp/cloud-sql-ip.sh

