# Market Scan Strategy & User Experience

## 🎯 Design Decision: Automated Scans Only

### Decision
**Market Scan runs automatically via Cloud Scheduler daily. Users only browse and review articles.**

### Rationale

#### ✅ Benefits of Automated-Only Approach:

1. **Consistency & Reliability**
   - Articles are scanned at the same time daily (e.g., 2 AM)
   - No dependency on user actions
   - Ensures fresh content is always available

2. **Resource Management**
   - Prevents duplicate scans (multiple users triggering simultaneously)
   - Better control over API costs (Gemini verification, RSS fetching)
   - Predictable resource usage

3. **User Experience**
   - Users don't need to remember to run scans
   - Content is always up-to-date when they visit
   - Simpler UI (no "Run Scan" button needed)

4. **Data Quality**
   - Single source of truth (one scan per day)
   - Better deduplication (no race conditions)
   - Consistent verification standards

5. **Scalability**
   - Works regardless of user count
   - No performance impact from manual triggers
   - Cloud Scheduler handles retries and failures

#### ❌ Issues with Manual Scans:

1. **Duplicate Scans**
   - Multiple users triggering scans simultaneously
   - Wasted resources and API costs
   - Potential race conditions

2. **Inconsistent Data**
   - Different users see different articles
   - Timing-dependent results
   - Harder to track scan history

3. **Abuse Potential**
   - Users could spam scan requests
   - Increased API costs
   - Server load issues

4. **User Confusion**
   - "Why isn't my scan showing articles?"
   - "When should I run a scan?"
   - "Did my scan work?"

### Implementation

#### Current State (Development)
- Manual scan button available for testing
- Useful for development and debugging
- Can be triggered via API: `POST /api/market-scan/run`

#### Production State (Recommended)
- **Remove manual scan button from UI**
- **Keep API endpoint for admin use only**
- **Set up Cloud Scheduler for daily automation**
- **Users only see "Refresh Articles" button**

### Admin Access (Optional)

If manual scans are needed for:
- Testing new sources
- Breaking news (emergency scans)
- Debugging issues

**Option 1: Admin-only API endpoint**
- Keep `/api/market-scan/run` but require admin role
- Add admin check: `if (user.role !== 'admin') return 403`

**Option 2: Separate admin UI**
- Create `/admin/market-scan` page
- Only accessible to admins
- Shows scan controls and history

### User Experience Flow

1. **Daily Automated Scan** (2 AM via Cloud Scheduler)
   - Fetches from all enabled sources
   - Verifies and deduplicates
   - Stores in database

2. **User Visits Market Scan Page**
   - Sees latest articles automatically
   - Can search and filter
   - Can refresh to get latest articles

3. **No Manual Actions Required**
   - Content is always fresh
   - No "Run Scan" button needed
   - Simple, clean interface

### UI Changes Made

✅ **Removed:**
- "Run Scan" button (manual trigger)

✅ **Kept:**
- "Refresh Articles" button (updates UI, doesn't trigger scan)
- Search and filter functionality
- Article browsing interface

✅ **Added:**
- Note: "Articles are automatically scanned daily"

### Cloud Scheduler Setup (Production)

```yaml
Schedule: 0 2 * * *  # 2 AM daily
Target: Cloud Function or Cloud Run endpoint
Endpoint: POST /api/market-scan/run
Authentication: Service account with proper permissions
```

### Benefits Summary

| Aspect | Automated Only | Manual + Automated |
|--------|----------------|-------------------|
| User Experience | ✅ Simple, always fresh | ❌ Requires action |
| Resource Usage | ✅ Predictable | ❌ Variable, can spike |
| Data Consistency | ✅ Single source | ❌ Multiple sources |
| Scalability | ✅ Works at any scale | ⚠️ Limited by manual triggers |
| Cost Control | ✅ Predictable | ❌ Can spike |
| User Confusion | ✅ None | ❌ "When to scan?" |

### Conclusion

**Recommendation: Automated daily scans only. Users browse and review.**

This aligns with:
- Original roadmap (Cloud Scheduler)
- Best practices for content aggregation
- Better user experience
- More reliable and scalable system

**Manual scans should be:**
- Admin-only feature (if needed)
- For testing/debugging
- Not exposed to regular users

