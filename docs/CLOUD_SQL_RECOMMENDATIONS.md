# Cloud SQL Configuration Recommendations

## Your Current Configuration

**Specs:**
- **Edition**: Enterprise
- **Machine Type**: db-custom-1-3840 (1 vCPU, 3.75 GB RAM)
- **Storage**: 10 GB SSD
- **Availability**: Single zone
- **Network**: Public IP
- **Backups**: Automated
- **Point-in-time Recovery**: Enabled
- **Estimated Cost**: ~$50/month (~$0.07/hour)

## Assessment

### ✅ What's Good

1. **PostgreSQL 15** - Latest stable version ✅
2. **Automated Backups** - Essential for production ✅
3. **Point-in-time Recovery** - Great for data protection ✅
4. **Compute Specs** - 1 vCPU + 3.75 GB RAM is reasonable for starting ✅
5. **Region** - us-central1 is good for US-based users ✅

### ⚠️ Recommendations for Production

#### 1. **Network Security** (Critical)
**Current**: Public IP  
**Recommendation**: Use **Private IP** instead

**Why:**
- Public IP exposes your database to the internet
- Private IP keeps database within GCP network
- Cloud Run can connect via VPC connector
- Much more secure

**How to fix:**
- When creating instance, select "Private IP" instead of "Public IP"
- Set up VPC connector for Cloud Run
- Update `DATABASE_URL` to use private IP format

#### 2. **Storage Size** (Important)
**Current**: 10 GB  
**Recommendation**: Start with **20-50 GB**

**Why:**
- 10 GB fills up quickly with:
  - User data (exam attempts, progress)
  - Market scan articles (growing content)
  - Concept cards, exam questions
  - Logs and backups
- Storage can be increased later, but 10 GB is tight

**Cost impact**: +$1.70-4.25/month (minimal)

#### 3. **High Availability** (Recommended for Production)
**Current**: Single zone  
**Recommendation**: Consider **High Availability (Multi-zone)**

**Why:**
- Single zone = single point of failure
- If zone goes down, database goes down
- HA provides automatic failover
- Better uptime SLA

**Cost impact**: ~2x cost (~$100/month), but worth it for production

**Alternative**: Start with single zone, upgrade to HA later

#### 4. **Edition** (Cost Optimization)
**Current**: Enterprise  
**Recommendation**: **Standard** edition is usually sufficient

**Why:**
- Enterprise edition costs more
- Standard edition has most features you need:
  - Automated backups ✅
  - Point-in-time recovery ✅
  - Read replicas ✅
- Enterprise features (advanced security, audit logs) may not be needed initially

**Cost impact**: Could save ~20-30% with Standard edition

**When to use Enterprise:**
- Need advanced security features
- Need audit logging
- Compliance requirements

## Recommended Configurations

### Option 1: Cost-Optimized (Development/Testing)
```
Edition: Standard
Machine Type: db-custom-1-3840 (1 vCPU, 3.75 GB RAM)
Storage: 20 GB SSD
Availability: Single zone
Network: Private IP
Backups: Automated
Point-in-time Recovery: Enabled
Estimated Cost: ~$40-45/month
```

### Option 2: Production-Ready (Recommended)
```
Edition: Standard
Machine Type: db-custom-1-3840 (1 vCPU, 3.75 GB RAM)
Storage: 50 GB SSD
Availability: High Availability (Multi-zone)
Network: Private IP
Backups: Automated
Point-in-time Recovery: Enabled
Estimated Cost: ~$80-100/month
```

### Option 3: Scale-Up (High Traffic)
```
Edition: Standard
Machine Type: db-custom-2-7680 (2 vCPU, 7.5 GB RAM)
Storage: 100 GB SSD
Availability: High Availability (Multi-zone)
Network: Private IP
Backups: Automated
Point-in-time Recovery: Enabled
Estimated Cost: ~$160-200/month
```

## Immediate Actions

### Must Fix (Before Production)
1. ✅ **Change to Private IP** - Critical security improvement
2. ✅ **Increase storage to 20-50 GB** - Avoid running out of space

### Should Consider
3. ⚠️ **Switch to Standard edition** - Save ~20-30% if Enterprise features not needed
4. ⚠️ **Consider High Availability** - Better uptime, but doubles cost

### Can Wait
5. ⏳ **Scale up compute** - Only if you see performance issues
6. ⏳ **Add read replicas** - Only if you need read scaling

## Storage Growth Estimate

**Initial Data:**
- Schema + indexes: ~100-200 MB
- 360+ concept cards: ~10-20 MB
- 40 level exams: ~50-100 MB
- Initial user data: ~10-50 MB
- **Total**: ~200-400 MB

**After 6 Months (Estimated):**
- User accounts: 1,000 users × 50 KB = 50 MB
- Exam attempts: 10,000 attempts × 5 KB = 50 MB
- Progress data: 1,000 users × 20 KB = 20 MB
- Market scan articles: 500 articles × 50 KB = 25 MB
- **Total**: ~500 MB - 1 GB

**After 1 Year (Estimated):**
- User accounts: 5,000 users × 50 KB = 250 MB
- Exam attempts: 50,000 attempts × 5 KB = 250 MB
- Progress data: 5,000 users × 20 KB = 100 MB
- Market scan articles: 2,000 articles × 50 KB = 100 MB
- **Total**: ~2-3 GB

**Recommendation**: 20-50 GB gives you plenty of headroom for growth.

## Cost Breakdown

### Your Current Config (~$50/month)
- Compute (1 vCPU): ~$30/month
- Memory (3.75 GB): ~$20/month
- Storage (10 GB): ~$1.70/month
- Backups: Included
- **Total**: ~$50/month

### Recommended Config (~$45-100/month)
- Compute (1 vCPU): ~$30/month
- Memory (3.75 GB): ~$20/month
- Storage (20-50 GB): ~$3.40-8.50/month
- Backups: Included
- HA (if enabled): +~$50/month
- **Total**: ~$45/month (single zone) or ~$100/month (HA)

## Monitoring Recommendations

After deployment, monitor:
1. **CPU Usage** - Should stay < 70% average
2. **Memory Usage** - Should stay < 80% average
3. **Storage Usage** - Set alerts at 70% and 85%
4. **Connection Count** - Monitor active connections
5. **Query Performance** - Check slow queries

## Summary

**Your current config is acceptable for:**
- ✅ Development/testing
- ✅ Small user base (< 100 users)
- ✅ Low traffic

**For production, consider:**
1. **Must**: Change to Private IP
2. **Must**: Increase storage to 20-50 GB
3. **Should**: Switch to Standard edition (if Enterprise features not needed)
4. **Should**: Consider High Availability (if uptime critical)

**Cost Impact:**
- Current: ~$50/month
- Recommended: ~$45/month (single zone) or ~$100/month (HA)
- Savings: $5-10/month with Standard edition
- Additional: +$50/month for HA

