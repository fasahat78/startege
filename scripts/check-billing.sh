#!/bin/bash
# Quick script to check GCP billing for Vector Search charges
# 
# Usage:
#   chmod +x scripts/check-billing.sh
#   ./scripts/check-billing.sh

PROJECT_ID="startege"

echo "💰 Checking GCP Billing for Vector Search Charges"
echo "================================================="
echo ""
echo "Project: ${PROJECT_ID}"
echo ""

echo "📊 Quick Billing Check:"
echo "----------------------"
echo ""
echo "1. Billing Dashboard:"
echo "   https://console.cloud.google.com/billing?project=${PROJECT_ID}"
echo ""
echo "2. Vertex AI Usage:"
echo "   https://console.cloud.google.com/vertex-ai/usage?project=${PROJECT_ID}"
echo ""
echo "3. Billing Reports:"
echo "   https://console.cloud.google.com/billing/reports"
echo ""
echo "4. Cost Breakdown:"
echo "   https://console.cloud.google.com/billing/${PROJECT_ID}/reports"
echo ""

echo "🔍 What to Look For:"
echo "-------------------"
echo ""
echo "✅ Good (No Vector Search charges):"
echo "   - $0 for 'Vector Search' services"
echo "   - $0 for 'Index' services"
echo "   - Only Gemini AI charges (expected)"
echo ""
echo "⚠️  Warning (Possible charges):"
echo "   - Charges for 'Vertex AI Vector Search API'"
echo "   - Charges for 'Index Storage'"
echo "   - Charges for 'Embedding Generation'"
echo ""
echo "💡 Note: Billing updates may take 24-48 hours"
echo ""

# Try to get billing account info if gcloud is configured
if command -v gcloud &> /dev/null; then
    echo "📋 Current Project Billing Status:"
    echo "-----------------------------------"
    gcloud billing projects describe ${PROJECT_ID} 2>/dev/null || echo "   (Billing info not available via CLI)"
    echo ""
fi

echo "📚 For detailed verification, see:"
echo "   docs/VERIFY_NO_CHARGES.md"
echo ""
echo "   Or run: npm run verify:vector-search"
