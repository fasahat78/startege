#!/bin/bash

# Setup Cloud SQL Proxy Script
# This script helps install and set up Cloud SQL Proxy

set -e

echo "🔧 Cloud SQL Proxy Setup"
echo "========================"
echo ""

# Check if already installed
if command -v cloud-sql-proxy &> /dev/null; then
    echo "✅ Cloud SQL Proxy is already installed"
    cloud-sql-proxy --version
    exit 0
fi

echo "📥 Installing Cloud SQL Proxy..."
echo ""

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

case "${OS}" in
    Linux*)
        if [ "${ARCH}" = "x86_64" ]; then
            URL="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.amd64"
        else
            URL="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.linux.arm64"
        fi
        ;;
    Darwin*)
        if [ "${ARCH}" = "x86_64" ]; then
            URL="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.amd64"
        else
            URL="https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.8.0/cloud-sql-proxy.darwin.arm64"
        fi
        ;;
    *)
        echo "❌ Unsupported OS: ${OS}"
        exit 1
        ;;
esac

echo "Downloading from: ${URL}"
curl -o cloud-sql-proxy "${URL}"
chmod +x cloud-sql-proxy

# Try to move to /usr/local/bin (requires sudo)
if sudo mv cloud-sql-proxy /usr/local/bin/ 2>/dev/null; then
    echo "✅ Installed to /usr/local/bin/cloud-sql-proxy"
else
    echo "⚠️  Could not install to /usr/local/bin (requires sudo)"
    echo "✅ Downloaded to current directory: ./cloud-sql-proxy"
    echo ""
    echo "You can either:"
    echo "1. Run: sudo mv cloud-sql-proxy /usr/local/bin/"
    echo "2. Or use: ./cloud-sql-proxy (from this directory)"
fi

echo ""
echo "✅ Cloud SQL Proxy setup complete!"
echo ""
echo "Next steps:"
echo "1. Authenticate: gcloud auth login"
echo "2. Start proxy: cloud-sql-proxy startege:us-central1:startege-db --port=5432"

