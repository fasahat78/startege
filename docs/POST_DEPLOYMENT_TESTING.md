# Post-Deployment Testing Checklist

## ✅ Deployment Complete!

- ✅ Database tables created
- ✅ Admin user created
- ✅ Cloud Build triggered
- ✅ Code deployed

## 🧪 Testing Checklist

### 1. Admin Dashboard
**URL:** `/admin`

**Test:**
- [ ] Can access admin dashboard (should redirect if not admin)
- [ ] See admin navigation menu
- [ ] User management page loads
- [ ] Discount codes page loads
- [ ] Early adopters page loads
- [ ] Analytics page loads

**Expected:** All pages accessible, no errors

---

### 2. AIGP Flashcards
**URL:** `/aigp-exams` → Click "Flashcards" tab

**Test:**
- [ ] Flashcards tab is visible and prominent
- [ ] All 132 flashcards load
- [ ] Can flip cards (click or spacebar)
- [ ] Can mark as "Got It!" (MASTERED)
- [ ] Can mark as "Need Review" (REVIEWING)
- [ ] Progress saves correctly
- [ ] Stats display correctly (Total, Not Started, Reviewing, Mastered)
- [ ] Filters work (Domain, Card Type, Priority, Study Mode)
- [ ] Shuffle works
- [ ] Navigation (Previous/Next) works
- [ ] Keyboard shortcuts work (Space/Enter to flip, ← → to navigate)

**Expected:** All flashcards load, progress saves, stats update

---

### 3. Discount Codes
**URL:** `/pricing`

**Test:**
- [ ] Discount code input field visible
- [ ] Can enter a discount code
- [ ] "Apply" button works
- [ ] Valid code shows success message
- [ ] Invalid code shows error message
- [ ] Discount applied at checkout
- [ ] Discount verification works after Stripe return
- [ ] Usage tracked in database

**Expected:** Discount codes work end-to-end

---

### 4. General Functionality
**Test:**
- [ ] Existing features still work (concepts, challenges, exams)
- [ ] Authentication works
- [ ] User menu shows "Admin Dashboard" link (if admin)
- [ ] No console errors
- [ ] No 500 errors in server logs

**Expected:** No regressions, everything works

---

## 🐛 Troubleshooting

### If flashcards don't load:
- Check Cloud Run logs for file read errors
- Verify `AIGP Flash Cards/` directory exists in container
- Check API route: `/api/aigp-exams/flashcards`

### If admin dashboard doesn't work:
- Verify `isAdmin` is set in database
- Check admin API route: `/api/admin/check`
- Verify Firebase authentication works

### If discount codes don't work:
- Check Stripe webhook configuration
- Verify discount code tables exist
- Check discount verification API route

### If database errors occur:
- Verify DATABASE_URL is correct in Cloud Run
- Check Cloud SQL connection
- Verify tables exist (run verification queries)

## 📊 Monitoring

**Cloud Run Logs:**
- https://console.cloud.google.com/run
- Check for errors, warnings

**Cloud Build Status:**
- https://console.cloud.google.com/cloud-build/builds
- Verify build completed successfully

**Database:**
- Run verification queries to confirm tables exist
- Check admin user exists: `SELECT email, "isAdmin", "role" FROM "User" WHERE email = 'fasahat@gmail.com';`

## ✅ Success Criteria

All features working:
- ✅ Admin dashboard accessible
- ✅ Flashcards load and save progress
- ✅ Discount codes work
- ✅ No errors in logs
- ✅ Existing features still work

## 🎉 Deployment Complete!

Once all tests pass, your new features are live!

