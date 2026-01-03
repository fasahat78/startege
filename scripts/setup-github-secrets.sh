#!/bin/bash

# GitHub Secrets Setup Script
# This script helps you set up GitHub Secrets using the GitHub CLI or API

set -e

REPO="fasahat78/startege"
GITHUB_TOKEN="${GITHUB_TOKEN:-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}"

echo "🔐 GitHub Secrets Setup Script"
echo "Repository: $REPO"
echo ""

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found"
    echo "Authenticating..."
    echo "$GITHUB_TOKEN" | gh auth login --with-token
    
    echo ""
    echo "📋 Setting up secrets..."
    echo "Please add your secrets manually via GitHub web interface:"
    echo "https://github.com/$REPO/settings/secrets/actions"
    echo ""
    echo "Or use 'gh secret set SECRET_NAME --body \"value\"' for each secret"
    echo ""
    echo "Required secrets are listed in docs/GITHUB_SECRETS_SETUP.md"
else
    echo "⚠️  GitHub CLI not found. Install it from https://cli.github.com/"
    echo ""
    echo "Alternatively, set secrets manually at:"
    echo "https://github.com/$REPO/settings/secrets/actions"
    echo ""
    echo "See docs/GITHUB_SECRETS_SETUP.md for the complete list"
fi

echo ""
echo "✅ Setup complete!"

