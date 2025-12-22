# Proposed Improvements Scope

**Document Purpose:** Capture all proposed improvements for future planning and decision-making
**Created:** December 2024
**Based On:** Admin Dashboard & Form Workflow Audit
**Status:** Pending Review

---

## How to Use This Document

Each improvement includes:
- **Priority**: Critical / High / Medium / Low
- **Effort**: Small (1-2 days) / Medium (3-5 days) / Large (1-2 weeks)
- **Decision Status**: Pending / Approved / Rejected / Deferred

Mark items as `[x]` when approved for implementation.

---

## 1. Security Improvements

### 1.1 Authentication & Authorization

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| SEC-001 | [ ] Replace `simpleHash` with bcrypt for password hashing | Critical | Medium | Pending |
| SEC-002 | [ ] Move setup key (`COGM_SETUP_2024`) to environment variable | High | Small | Pending |
| SEC-003 | [ ] Add session token validation to admin-only API mutations | High | Medium | Pending |
| SEC-004 | [ ] Replace `Math.random()` token generation with crypto-secure alternative | Medium | Small | Pending |
| SEC-005 | [ ] Implement rate limiting on login attempts | Medium | Medium | Pending |
| SEC-006 | [ ] Implement rate limiting on form submissions | Medium | Medium | Pending |
| SEC-007 | [ ] Add CSRF protection to forms | Medium | Small | Pending |

**Files Affected:**
- `convex/auth.ts`
- `convex/submissions.ts`
- `app/providers/AuthProvider.tsx`

---

## 2. Form Workflow Improvements

### 2.1 Validation

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| FORM-001 | [ ] Add email format validation on `submitterEmail` field | High | Small | Pending |
| FORM-002 | [ ] Add URL format validation on `obituaryLink` field | High | Small | Pending |
| FORM-003 | [ ] Prevent future dates for `passingDate` field | High | Small | Pending |
| FORM-004 | [ ] Validate `yearsOfService` format (YYYY-YYYY) | Medium | Small | Pending |
| FORM-005 | [ ] Add inline validation error messages (replace `alert()`) | Medium | Medium | Pending |

### 2.2 File Upload

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| FORM-006 | [ ] Add maximum file size validation (e.g., 10MB per file) | Medium | Small | Pending |
| FORM-007 | [ ] Add total upload size limit (e.g., 50MB) | Medium | Small | Pending |
| FORM-008 | [ ] Show individual file upload progress | Medium | Medium | Pending |
| FORM-009 | [ ] Upload files in parallel using `Promise.all()` | Low | Small | Pending |

### 2.3 User Experience

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| FORM-010 | [ ] Implement form draft auto-save to localStorage | Medium | Medium | Pending |
| FORM-011 | [ ] Add toast notifications for success/error states | Medium | Medium | Pending |
| FORM-012 | [ ] Add "unsaved changes" warning on navigation | Low | Small | Pending |
| FORM-013 | [ ] Add loading skeleton while Convex initializes | Low | Small | Pending |

**Files Affected:**
- `app/page.tsx`

---

## 3. Admin Dashboard Improvements

### 3.1 Data Management

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| ADMIN-001 | [ ] Implement cursor-based pagination (25 items per page) | High | Medium | Pending |
| ADMIN-002 | [ ] Add audit logging (who changed what, when) | High | Large | Pending |
| ADMIN-003 | [ ] Add bulk select and status update | Medium | Medium | Pending |
| ADMIN-004 | [ ] Add bulk delete with confirmation | Medium | Medium | Pending |
| ADMIN-005 | [ ] Add submission notes/comments field | Medium | Small | Pending |

### 3.2 Filtering & Search

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| ADMIN-006 | [ ] Persist filter state in URL query params | Low | Small | Pending |
| ADMIN-007 | [ ] Add full-text search capability | Low | Large | Pending |
| ADMIN-008 | [ ] Add "New submissions available" real-time indicator | Low | Medium | Pending |

### 3.3 Export

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| ADMIN-009 | [ ] Add date range picker for exports | Medium | Small | Pending |
| ADMIN-010 | [ ] Add custom column selection for CSV export | Low | Medium | Pending |
| ADMIN-011 | [ ] Include all relevant fields in PDF export | Low | Small | Pending |

### 3.4 Permissions

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| ADMIN-012 | [ ] Enforce role-based access (admin vs viewer) | Medium | Medium | Pending |
| ADMIN-013 | [ ] Add viewer role with read-only access | Medium | Medium | Pending |

**Files Affected:**
- `app/admin/page.tsx`
- `app/admin/ExportButtons.tsx`
- `convex/submissions.ts`
- New: `convex/auditLog.ts`

---

## 4. Performance Optimizations

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| PERF-001 | [ ] Use proper index queries for status filtering | Medium | Small | Pending |
| PERF-002 | [ ] Implement URL caching with expiration for files | Low | Medium | Pending |
| PERF-003 | [ ] Add `React.memo()` for submission list items | Low | Small | Pending |
| PERF-004 | [ ] Lazy load document preview components | Low | Medium | Pending |

**Files Affected:**
- `convex/submissions.ts`
- `app/admin/page.tsx`

---

## 5. Accessibility Improvements

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| A11Y-001 | [ ] Add focus trap to modals | Medium | Small | Pending |
| A11Y-002 | [ ] Return focus to trigger after modal close | Medium | Small | Pending |
| A11Y-003 | [ ] Add skip navigation link | Low | Small | Pending |
| A11Y-004 | [ ] Add proper ARIA roles to data table | Low | Small | Pending |
| A11Y-005 | [ ] Add ARIA live region for filter result announcements | Low | Small | Pending |
| A11Y-006 | [ ] Verify color contrast on status badges (WCAG AA) | Low | Small | Pending |

**Files Affected:**
- `app/admin/page.tsx`
- `app/page.tsx`

---

## 6. UX/UI Improvements

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| UX-001 | [ ] Add context-aware empty states | Low | Small | Pending |
| UX-002 | [ ] Add confirmation dialog for publish action | Medium | Small | Pending |
| UX-003 | [ ] Add keyboard shortcuts (Esc, n/p navigation) | Low | Medium | Pending |
| UX-004 | [ ] Implement card-based layout for mobile | Medium | Large | Pending |
| UX-005 | [ ] Add collapsible filter section on mobile | Medium | Small | Pending |
| UX-006 | [ ] Add print-specific CSS styles | Low | Small | Pending |

**Files Affected:**
- `app/admin/page.tsx`
- `app/globals.css` or new print styles

---

## 7. Code Quality Improvements

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| CODE-001 | [ ] Split admin dashboard into smaller components | Medium | Large | Pending |
| CODE-002 | [ ] Create shared types file for submission status | Low | Small | Pending |
| CODE-003 | [ ] Add error boundaries at route level | Medium | Medium | Pending |
| CODE-004 | [ ] Extract reusable form components | Low | Medium | Pending |

**Proposed Component Structure:**
```
app/admin/
├── page.tsx (main orchestration)
├── components/
│   ├── StatCard.tsx
│   ├── StatusBadge.tsx
│   ├── SubmissionsTable.tsx
│   ├── FilterBar.tsx
│   ├── DetailModal.tsx
│   ├── DeleteDialog.tsx
│   └── DocumentPreview.tsx
```

---

## 8. Testing Improvements

| ID | Improvement | Priority | Effort | Status |
|----|-------------|----------|--------|--------|
| TEST-001 | [ ] Add test fixtures/mock data setup | Medium | Medium | Pending |
| TEST-002 | [ ] Add Convex backend function tests | Medium | Large | Pending |
| TEST-003 | [ ] Add end-to-end form submission test | Medium | Medium | Pending |
| TEST-004 | [ ] Add session timeout behavior tests | Low | Small | Pending |

**Files Affected:**
- `tests/*.spec.ts`
- New: `convex/*.test.ts`

---

## Summary by Priority

### Critical (Address Immediately)
- SEC-001: Password hashing

### High Priority
- SEC-002, SEC-003: Security hardening
- FORM-001, FORM-002, FORM-003: Input validation
- ADMIN-001, ADMIN-002: Pagination & audit trail

### Medium Priority
- 20 items across security, form, admin, accessibility, and code quality

### Low Priority
- 15 items for polish and optimization

---

## Decision Log

| Date | Item IDs | Decision | Decided By | Notes |
|------|----------|----------|------------|-------|
| | | | | |

---

## Implementation Phases (Suggested)

### Phase 1: Security Hardening
- SEC-001, SEC-002, SEC-003
- Estimated: 1 week

### Phase 2: Form Improvements
- FORM-001 through FORM-005
- Estimated: 1 week

### Phase 3: Admin Core Features
- ADMIN-001, ADMIN-002, ADMIN-005
- Estimated: 2 weeks

### Phase 4: UX Polish
- UX-002, UX-004, A11Y-001, A11Y-002
- Estimated: 1 week

### Phase 5: Code Quality
- CODE-001, CODE-003, TEST-001, TEST-002
- Estimated: 2 weeks

---

## Notes

- All estimates assume single developer
- Testing time included in estimates
- Dependencies between items should be considered during planning
- Security items should be prioritized before public launch
