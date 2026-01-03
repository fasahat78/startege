# Next Steps Roadmap

## ✅ Completed (Dashboard Redesign)

### Phase 1: Navigation & User Menu ✅
- User menu dropdown component
- Header navigation updates
- Moved Pricing and Badges to user menu

### Phase 2: New Pages ✅
- `/dashboard/profile` - User profile page
- `/dashboard/settings` - Settings page (structure complete)
- `/dashboard/billing` - Subscription & billing management
- `/dashboard/analytics` - Placeholder page

### Phase 3: Dashboard Redesign ✅
- Value-centric feature layout
- PrimaryFeatureCard component
- Removed Profile card from main dashboard

---

## 🎯 Next Priority Items

### 1. **Analytics Page Implementation** (High Priority)
**Status**: Placeholder exists, needs full implementation

**What to Build**:
- Overview metrics dashboard
- Progress charts (learning over time, domain coverage)
- Performance insights (strongest domains, improvement areas)
- Recommended next steps

**Dependencies**:
- Data aggregation queries
- Chart library integration (e.g., Recharts, Chart.js)
- Performance calculations

**Estimated Effort**: 2-3 days

---

### 2. **Settings Page Features** (Medium Priority)
**Status**: Structure exists, features marked "Coming Soon"

**What to Build**:
- **Notification Preferences**:
  - Email notifications toggle
  - In-app notifications toggle
  - Learning reminders configuration
  - API endpoints for preferences

- **Privacy Settings**:
  - Profile visibility controls
  - Data sharing preferences
  - Privacy policy links

- **Data Management**:
  - Export user data (JSON/CSV)
  - Delete account functionality
  - Data retention policies

**Dependencies**:
- Database schema for preferences
- Email service integration
- Data export logic

**Estimated Effort**: 2-3 days

---

### 3. **Market Scan Feature** (High Priority - Premium Feature)
**Status**: Roadmap exists, not yet implemented

**What to Build** (from roadmap):
- Daily automated scanning via Cloud Scheduler
- Source integration (regulatory bodies, news, case studies)
- Vector DB integration (Vertex AI Vector Search)
- Content verification and deduplication
- Market Scan UI for browsing/searching
- Integration with Startegizer RAG

**Dependencies**:
- GCP Cloud Scheduler setup
- Vertex AI Vector Search configuration
- Source APIs/integrations
- Content verification logic

**Estimated Effort**: 1-2 weeks

---

### 4. **Billing Page Enhancements** (Medium Priority)
**Status**: Basic implementation complete

**What to Enhance**:
- Billing history display (past invoices)
- Credit purchase history
- Payment method management UI
- Subscription upgrade/downgrade flows
- Better error handling

**Dependencies**:
- Stripe API integration
- Invoice retrieval
- Payment method management

**Estimated Effort**: 1-2 days

---

### 5. **Testing & Refinement** (Ongoing)
**Status**: Needs attention

**What to Do**:
- User testing of new dashboard layout
- Mobile responsiveness testing
- Cross-browser testing
- Performance optimization
- Accessibility audit
- Fix any bugs discovered

**Estimated Effort**: Ongoing

---

## 📊 Recommended Implementation Order

### **Sprint 1: Analytics & Settings** (1 week)
1. **Analytics Page** (3 days)
   - Data queries and aggregation
   - Chart implementation
   - Performance insights

2. **Settings Features** (2 days)
   - Notification preferences
   - Privacy settings
   - Data export

### **Sprint 2: Market Scan Foundation** (1-2 weeks)
1. **Market Scan Backend** (1 week)
   - Cloud Scheduler setup
   - Source integrations
   - Vector DB integration
   - Content verification

2. **Market Scan UI** (3-5 days)
   - Browse/search interface
   - Article display
   - Filtering and sorting

### **Sprint 3: Polish & Enhancements** (1 week)
1. **Billing Enhancements** (2 days)
2. **Testing & Bug Fixes** (3 days)
3. **Performance Optimization** (2 days)

---

## 🎨 Design Considerations

### Analytics Page
- Use consistent chart library (recommend Recharts for React)
- Responsive grid layout
- Color-coded metrics (green for good, yellow for warning, red for attention)
- Export functionality for reports

### Settings Page
- Tabbed or accordion interface
- Clear save/cancel actions
- Confirmation dialogs for destructive actions
- Success/error feedback

### Market Scan UI
- Card-based article layout
- Advanced search with filters
- Date range picker
- Source badges
- Bookmark/favorite functionality

---

## 🔧 Technical Debt & Improvements

### Short-term
- [ ] Add loading states to all async operations
- [ ] Improve error handling and user feedback
- [ ] Add skeleton loaders for better UX
- [ ] Optimize database queries (add indexes if needed)

### Medium-term
- [ ] Implement caching strategy
- [ ] Add analytics tracking (user behavior)
- [ ] Improve mobile navigation
- [ ] Add keyboard shortcuts

### Long-term
- [ ] Consider state management library (Zustand/Redux)
- [ ] Implement offline support (PWA)
- [ ] Add dark mode toggle
- [ ] Internationalization (i18n)

---

## 📝 Notes

- **Analytics** is high priority because it's a premium feature that users expect
- **Market Scan** is high priority because it's a core differentiator and powers Startegizer RAG
- **Settings** features improve user experience and trust
- **Testing** should be ongoing throughout development

---

**Last Updated**: 2025-01-XX
**Status**: Ready for Sprint Planning

