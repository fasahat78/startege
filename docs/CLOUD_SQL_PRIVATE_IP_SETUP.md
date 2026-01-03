# Cloud SQL Private IP Setup Guide

## What to Select for Private IP Configuration

When setting up Private IP for your Cloud SQL instance, follow these steps:

### Step 1: Enable Private IP

✅ **Check the "Private IP" checkbox**

### Step 2: Choose Private Connection Method

**Select: "Private Service Access (PSA)"** ✅

**Why PSA?**
- ✅ Recommended for Cloud Run → Cloud SQL connections
- ✅ Works with single VPC networks (which is what you need)
- ✅ Simpler setup than Private Service Connect (PSC)
- ✅ Automatic IP range allocation
- ✅ Best for most use cases

**When to use PSC instead:**
- Only if you need to connect to multiple VPC networks
- Only if you have specific networking requirements
- For most applications, PSA is sufficient

### Step 3: Configure VPC Network

**VPC Network**: Select **"default"** ✅

- This is your project's default VPC network
- Cloud Run will use this same network
- If you have a custom VPC, select that instead

### Step 4: Configure IP Range Allocation

**Allocated IP range**: Select **"Automatic"** ✅

- Google will automatically allocate an IP range
- No manual configuration needed
- Recommended for most setups

**Alternative**: Manual allocation (only if you have specific IP range requirements)

### Step 5: Confirm Network Setup

**Click the "Confirm network setup" button** ✅

This will:
1. Enable the Service Networking API (if not already enabled)
2. Allocate an IP range in your selected VPC network
3. Set up the private connection

**Time**: Typically takes 1-2 minutes

**Note**: This is a one-time setup per VPC network. Once done, future Cloud SQL instances can use the same setup.

## What Happens After Setup

After clicking "Confirm network setup":

1. **Service Networking API** will be enabled automatically
2. **IP range** will be allocated in your VPC network
3. **Private IP** will be assigned to your Cloud SQL instance
4. You can proceed with creating the instance

## Connecting Cloud Run to Private IP Cloud SQL

After your Cloud SQL instance is created with Private IP:

1. **Update Cloud Run Service**:
   - Go to Cloud Run → Your service → Edit
   - Go to "Connections" tab
   - Under "Cloud SQL connections", click "ADD CLOUD SQL CONNECTION"
   - Select your Cloud SQL instance
   - Click "SAVE"

2. **Update DATABASE_URL**:
   - Format: `postgresql://USERNAME:PASSWORD@/DATABASE_NAME?host=/cloudsql/CONNECTION_NAME`
   - Replace `CONNECTION_NAME` with your Cloud SQL connection name
   - Example: `postgresql://postgres:mypassword@/startege?host=/cloudsql/startege:us-central1:startege-db`

3. **No Public IP Needed**:
   - Cloud Run connects via private network
   - More secure than public IP
   - No firewall rules needed

## Troubleshooting

### Service Networking API Not Enabled

**Symptom**: You see "Service Networking API: Not enabled"

**Solution**: 
- Click "Confirm network setup" - it will enable the API automatically
- Or manually enable it: https://console.cloud.google.com/apis/library/servicenetworking.googleapis.com

### IP Range Allocation Failed

**Symptom**: Error allocating IP range

**Solution**:
- Ensure you have permissions to modify VPC networks
- Check that the VPC network exists
- Try selecting a different VPC network
- Contact GCP support if issue persists

### Cloud Run Can't Connect

**Symptom**: Cloud Run service can't connect to Cloud SQL

**Solution**:
1. Verify Cloud SQL connection is added in Cloud Run service settings
2. Check that DATABASE_URL uses the correct connection name format
3. Ensure both Cloud Run and Cloud SQL are in the same VPC network
4. Check Cloud Run logs for connection errors

## Summary

**What to Select:**
- ✅ Private IP: **Checked**
- ✅ Connection Method: **Private Service Access (PSA)**
- ✅ VPC Network: **default** (or your VPC)
- ✅ IP Range: **Automatic**
- ✅ Click: **"Confirm network setup"**

**Result:**
- Secure private connection
- No public IP exposure
- Cloud Run can connect via VPC
- One-time setup per VPC

