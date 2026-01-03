#!/bin/bash

# Cloud Scheduler Setup Script for Market Scan
# This script helps set up the Cloud Scheduler job for daily Market Scan automation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Cloud Scheduler Setup for Market Scan${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed${NC}"
    echo "Install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${YELLOW}⚠️  .env file not found. Using defaults.${NC}"
fi

# Configuration
PROJECT_ID=${GCP_PROJECT_ID:-${NEXT_PUBLIC_GCP_PROJECT_ID}}
REGION=${GCP_LOCATION:-us-central1}
APP_URL=${NEXT_PUBLIC_APP_URL:-http://localhost:3000}
SCHEDULER_KEY=${CLOUD_SCHEDULER_SECRET_KEY}
JOB_NAME="daily-market-scan"
SCHEDULE="0 2 * * *"  # Daily at 2 AM UTC

# Validate required variables
if [ -z "$PROJECT_ID" ]; then
    echo -e "${RED}❌ GCP_PROJECT_ID not set${NC}"
    echo "Set it in .env or export it: export GCP_PROJECT_ID=your-project-id"
    exit 1
fi

if [ -z "$APP_URL" ] || [ "$APP_URL" == "http://localhost:3000" ]; then
    echo -e "${YELLOW}⚠️  APP_URL not set or using localhost${NC}"
    read -p "Enter your production URL: " APP_URL
fi

# Generate secret key if not set
if [ -z "$SCHEDULER_KEY" ]; then
    echo -e "${YELLOW}⚠️  CLOUD_SCHEDULER_SECRET_KEY not set${NC}"
    echo "Generating a secure random key..."
    SCHEDULER_KEY=$(openssl rand -hex 32)
    echo -e "${GREEN}✅ Generated key: ${SCHEDULER_KEY}${NC}"
    echo ""
    echo "Add this to your .env file:"
    echo "CLOUD_SCHEDULER_SECRET_KEY=${SCHEDULER_KEY}"
    echo ""
    read -p "Press Enter to continue..."
fi

echo "Configuration:"
echo "  Project ID: ${PROJECT_ID}"
echo "  Region: ${REGION}"
echo "  App URL: ${APP_URL}"
echo "  Job Name: ${JOB_NAME}"
echo "  Schedule: ${SCHEDULE} (Daily at 2 AM UTC)"
echo ""

# Check if Cloud Scheduler API is enabled
echo "Checking Cloud Scheduler API..."
if ! gcloud services list --enabled --project=$PROJECT_ID | grep -q "cloudscheduler.googleapis.com"; then
    echo -e "${YELLOW}⚠️  Cloud Scheduler API not enabled${NC}"
    read -p "Enable it now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gcloud services enable cloudscheduler.googleapis.com --project=$PROJECT_ID
        echo -e "${GREEN}✅ Cloud Scheduler API enabled${NC}"
    else
        echo -e "${RED}❌ Cannot proceed without Cloud Scheduler API${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Cloud Scheduler API is enabled${NC}"
fi

echo ""

# Check if job already exists
if gcloud scheduler jobs describe $JOB_NAME --project=$PROJECT_ID --location=$REGION &> /dev/null; then
    echo -e "${YELLOW}⚠️  Job '${JOB_NAME}' already exists${NC}"
    read -p "Update existing job? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Updating job..."
        gcloud scheduler jobs update http $JOB_NAME \
            --project=$PROJECT_ID \
            --location=$REGION \
            --schedule="$SCHEDULE" \
            --uri="${APP_URL}/api/market-scan/scheduled" \
            --http-method=POST \
            --headers="x-scheduler-key=${SCHEDULER_KEY}" \
            --time-zone="UTC" \
            --attempt-deadline=540s \
            --max-retry-attempts=3 \
            --max-retry-duration=3600s
        
        echo -e "${GREEN}✅ Job updated${NC}"
    else
        echo "Skipping update. Exiting."
        exit 0
    fi
else
    echo "Creating new job..."
    gcloud scheduler jobs create http $JOB_NAME \
        --project=$PROJECT_ID \
        --location=$REGION \
        --schedule="$SCHEDULE" \
        --uri="${APP_URL}/api/market-scan/scheduled" \
        --http-method=POST \
        --headers="x-scheduler-key=${SCHEDULER_KEY}" \
        --time-zone="UTC" \
        --attempt-deadline=540s \
        --max-retry-attempts=3 \
        --max-retry-duration=3600s \
        --description="Daily automated Market Scan"
    
    echo -e "${GREEN}✅ Job created${NC}"
fi

echo ""
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Add to your .env file:"
echo "   CLOUD_SCHEDULER_SECRET_KEY=${SCHEDULER_KEY}"
echo ""
echo "2. Test the job:"
echo "   gcloud scheduler jobs run ${JOB_NAME} --project=${PROJECT_ID} --location=${REGION}"
echo ""
echo "3. Monitor execution:"
echo "   gcloud scheduler jobs describe ${JOB_NAME} --project=${PROJECT_ID} --location=${REGION}"
echo ""

