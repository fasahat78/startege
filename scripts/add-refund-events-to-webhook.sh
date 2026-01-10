#!/bin/bash

# Script to add refund events to Stripe webhook endpoint
# Usage: ./scripts/add-refund-events-to-webhook.sh

WEBHOOK_ENDPOINT_ID="we_1SmZ6ABek6nTXNYzY5vceSzp"
STRIPE_SECRET_KEY="${STRIPE_SECRET_KEY:-}"

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "Error: STRIPE_SECRET_KEY environment variable not set"
  echo "Usage: STRIPE_SECRET_KEY=sk_live_... ./scripts/add-refund-events-to-webhook.sh"
  exit 1
fi

echo "Fetching current webhook configuration..."
CURRENT_EVENTS=$(curl -s -u "$STRIPE_SECRET_KEY:" \
  "https://api.stripe.com/v1/webhook_endpoints/$WEBHOOK_ENDPOINT_ID" | \
  jq -r '.enabled_events[]')

echo "Current events:"
echo "$CURRENT_EVENTS" | while read event; do
  echo "  - $event"
done

# Check if events already exist
if echo "$CURRENT_EVENTS" | grep -q "charge.refunded"; then
  echo "⚠️  charge.refunded already exists"
else
  echo "✅ Adding charge.refunded"
fi

if echo "$CURRENT_EVENTS" | grep -q "payment_intent.refunded"; then
  echo "⚠️  payment_intent.refunded already exists"
else
  echo "✅ Adding payment_intent.refunded"
fi

# Build events array (append new events to existing)
ALL_EVENTS=$(echo "$CURRENT_EVENTS" | jq -R -s -c 'split("\n") | map(select(. != ""))')
ALL_EVENTS=$(echo "$ALL_EVENTS" | jq '. + ["charge.refunded", "payment_intent.refunded"] | unique')

echo ""
echo "Updating webhook with events..."
echo "Events to be set:"
echo "$ALL_EVENTS" | jq -r '.[]' | while read event; do
  echo "  - $event"
done

# Update webhook
RESPONSE=$(curl -s -u "$STRIPE_SECRET_KEY:" \
  -X POST \
  "https://api.stripe.com/v1/webhook_endpoints/$WEBHOOK_ENDPOINT_ID" \
  -d "enabled_events=$(echo $ALL_EVENTS | jq -c .)")

if echo "$RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
  echo ""
  echo "✅ Webhook updated successfully!"
  echo "Updated events:"
  echo "$RESPONSE" | jq -r '.enabled_events[]' | while read event; do
    echo "  - $event"
  done
else
  echo ""
  echo "❌ Error updating webhook:"
  echo "$RESPONSE" | jq .
  exit 1
fi

