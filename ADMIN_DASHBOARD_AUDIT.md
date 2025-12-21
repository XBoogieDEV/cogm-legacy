# Admin Dashboard & Form Workflow Audit Report

**Date:** December 21, 2025
**Project:** COGM Memorial (cogm-legacy)
**Scope:** Full audit of admin dashboard, form workflows, security, and testing coverage

---

## Executive Summary

This audit identifies 32 improvement opportunities across 7 categories. The codebase is well-structured with good separation of concerns, but has several areas that would benefit from enhancement, particularly in security, form validation, and test coverage.

---

## 1. Security Concerns (Critical)

### 1.1 Password Hashing - CRITICAL
**File:** `convex/auth.ts:6-15`

**Issue:** The `simpleHash` function is cryptographically insecure and should never be used in production.

```typescript
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `hashed_${Math.abs(hash).toString(36)}_${password.length}`;
}
```

**Recommendation:** Use bcrypt or Argon2 via a Convex action that calls a proper hashing library.

### 1.2 Hardcoded Setup Key - HIGH
**File:** `convex/auth.ts:155`

**Issue:** Setup key `COGM_SETUP_2024` is hardcoded in source code.

**Recommendation:** Move to environment variable (`CONVEX_SETUP_KEY`) and document in deployment guide.

### 1.3 Admin Routes Not Protected at API Level - HIGH
**File:** `convex/submissions.ts`

**Issue:** Admin mutations (`updateStatus`, `remove`, `clearAll`) don't validate authentication.

**Recommendation:** Add session token validation to all admin-only mutations:
```typescript
// Add to each admin mutation
const session = await validateAdminSession(ctx, args.token);
if (!session) throw new Error("Unauthorized");
```

### 1.4 Token Generation - MEDIUM
**File:** `convex/auth.ts:17-24`

**Issue:** Token generation uses `Math.random()` which is not cryptographically secure.

**Recommendation:** Use a cryptographically secure random generator.

### 1.5 Missing Rate Limiting - MEDIUM
**Issue:** No rate limiting on login attempts, form submissions, or API calls.

**Recommendation:** Implement rate limiting using Convex's scheduling or an external service.

---

## 2. Form Workflow Improvements

### 2.1 Client-Side Validation - HIGH
**File:** `app/page.tsx`

**Issues:**
- No email format validation on `submitterEmail` field
- No URL validation on `obituaryLink` field
- No date validation (future dates allowed for `passingDate`)
- `yearsOfService` accepts any text format

**Recommendations:**
```typescript
// Add validation before submit
const validateForm = () => {
  const errors: string[] = [];

  // Email validation
  if (formData.submitterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.submitterEmail)) {
    errors.push("Invalid email format");
  }

  // URL validation
  if (formData.obituaryLink && !/^https?:\/\/.+/.test(formData.obituaryLink)) {
    errors.push("Invalid URL format");
  }

  // Date validation - no future dates
  if (new Date(formData.passingDate) > new Date()) {
    errors.push("Passing date cannot be in the future");
  }

  // Years of service format
  if (!/^\d{4}-\d{4}$/.test(formData.yearsOfService)) {
    errors.push("Years of service should be in format YYYY-YYYY");
  }

  return errors;
};
```

### 2.2 File Upload Improvements - MEDIUM
**File:** `app/page.tsx:232-244`

**Issues:**
- No file size limit validation
- No total upload size check
- No progress indication for large files
- Files are uploaded sequentially (slow for multiple files)

**Recommendations:**
- Add maximum file size check (e.g., 10MB per file)
- Add total upload size limit (e.g., 50MB total)
- Show individual file upload progress
- Upload files in parallel using `Promise.all()`

### 2.3 Form State Persistence - MEDIUM
**Issue:** Form data is lost on page refresh or navigation away.

**Recommendation:** Implement localStorage draft saving:
```typescript
useEffect(() => {
  const draft = localStorage.getItem('memorial_form_draft');
  if (draft) setFormData(JSON.parse(draft));
}, []);

useEffect(() => {
  localStorage.setItem('memorial_form_draft', JSON.stringify(formData));
}, [formData]);
```

### 2.4 Missing Loading States - LOW
**Issue:** No skeleton/loading states while Convex mutations initialize.

**Recommendation:** Add loading states for mutation readiness.

### 2.5 Error Handling UX - MEDIUM
**File:** `app/page.tsx:300-303`

**Issue:** Only uses `alert()` for errors, poor UX.

**Recommendation:** Implement toast notifications or inline error messages.

---

## 3. Admin Dashboard Improvements

### 3.1 Missing Pagination - HIGH
**File:** `app/admin/page.tsx`

**Issue:** All submissions are loaded at once, which won't scale.

**Recommendation:** Implement cursor-based pagination:
```typescript
const [cursor, setCursor] = useState<string | null>(null);
const submissions = useQuery(api.submissions.listPaginated, {
  cursor,
  limit: 25,
  status: statusFilter
});
```

### 3.2 Bulk Actions - MEDIUM
**Issue:** No way to update multiple submissions at once.

**Recommendation:** Add checkbox selection and bulk status update:
- Select all on page
- Bulk mark as reviewed
- Bulk publish
- Bulk delete (with confirmation)

### 3.3 Export Improvements - MEDIUM
**File:** `app/admin/ExportButtons.tsx`

**Issues:**
- No date range in exports
- No custom column selection
- PDF export doesn't include all fields

**Recommendations:**
- Add date range picker for exports
- Allow column selection for CSV
- Include all relevant fields in PDF

### 3.4 Missing Audit Trail - HIGH
**Issue:** No history of who changed what and when.

**Recommendation:** Add an `auditLog` table:
```typescript
defineTable({
  submissionId: v.id("submissions"),
  userId: v.id("adminUsers"),
  action: v.string(), // "created", "updated_status", "deleted"
  previousValue: v.optional(v.string()),
  newValue: v.optional(v.string()),
  timestamp: v.number(),
})
```

### 3.5 Dashboard Filters Persistence - LOW
**Issue:** Filters reset on page reload.

**Recommendation:** Persist filter state in URL query params:
```typescript
// Use Next.js useSearchParams
const searchParams = useSearchParams();
const initialStatus = searchParams.get('status') || 'all';
```

### 3.6 Real-time Updates Indicator - LOW
**Issue:** No visual indication when new submissions arrive.

**Recommendation:** Add a "New submissions available" badge that appears when data changes.

### 3.7 Submission Notes/Comments - MEDIUM
**Issue:** Limited ability to add review notes to submissions.

**Recommendation:** Add a notes field in the detail modal that persists with the submission.

### 3.8 Role-Based Permissions - MEDIUM
**File:** `app/providers/AuthProvider.tsx:8-12`

**Issue:** Role system exists but isn't enforced (admin vs viewer).

**Recommendation:** Implement role-based access control:
- Viewers: Read-only access
- Admins: Full CRUD operations

---

## 4. Performance Optimizations

### 4.1 Query Optimization - MEDIUM
**File:** `convex/submissions.ts:57-83`

**Issue:** Filtering happens in memory after fetching all records.

**Recommendation:** Use proper index queries for status filtering:
```typescript
if (args.status) {
  return ctx.db
    .query("submissions")
    .withIndex("by_status", (q) => q.eq("status", args.status))
    .order("desc")
    .take(args.limit || 100);
}
```

### 4.2 File URL Caching - LOW
**Issue:** File URLs are regenerated on every component render.

**Recommendation:** Implement URL caching with expiration.

### 4.3 Component Memoization - LOW
**File:** `app/admin/page.tsx`

**Issue:** Large component file (1465 lines) with many inline components.

**Recommendations:**
- Extract components to separate files
- Use `React.memo()` for list items
- Use `useMemo` for expensive filter operations (already done for `filteredSubmissions`)

---

## 5. Testing Improvements

### 5.1 Missing Test Coverage

**Current Coverage:**
- Main page tests: Basic landing and form display
- Admin page tests: Basic dashboard display
- Accessibility tests: WCAG compliance

**Missing Tests:**
- [ ] Form submission flow (end-to-end)
- [ ] File upload functionality
- [ ] Admin login/logout flow
- [ ] Status change workflow
- [ ] Delete confirmation flow
- [ ] Search with results validation
- [ ] Filter combination tests
- [ ] Export functionality
- [ ] Error state handling
- [ ] Session timeout behavior

### 5.2 Test Data Setup
**Issue:** Tests rely on existing data which may not exist.

**Recommendation:** Add test fixtures or mock data setup in `beforeEach`.

### 5.3 Missing API Tests
**Issue:** No tests for Convex backend functions.

**Recommendation:** Add Convex function tests using their testing utilities.

---

## 6. Accessibility Enhancements

### 6.1 Focus Management - MEDIUM
**File:** `app/admin/page.tsx`

**Issues:**
- Modal focus not trapped
- Focus not returned to trigger after modal close
- Skip link missing

**Recommendations:**
```typescript
// Add focus trap to modals
import { FocusTrap } from '@headlessui/react';

// Return focus to trigger
const triggerRef = useRef<HTMLButtonElement>(null);
const onClose = () => {
  setSelectedSubmission(null);
  triggerRef.current?.focus();
};
```

### 6.2 ARIA Labels - LOW
**File:** `app/admin/page.tsx:1324`

**Issue:** Table lacks proper ARIA roles and labels.

**Recommendation:**
```html
<table role="grid" aria-label="Memorial submissions">
  <thead role="rowgroup">
    <tr role="row">
      <th role="columnheader" scope="col">Name</th>
    </tr>
  </thead>
</table>
```

### 6.3 Announcement for Dynamic Content - LOW
**Issue:** Screen readers not notified of filter/search result changes.

**Recommendation:** Add ARIA live region:
```html
<div aria-live="polite" aria-atomic="true" className="sr-only">
  Showing {filteredSubmissions.length} of {stats.total} submissions
</div>
```

### 6.4 Color Contrast on Status Badges - LOW
**Issue:** Some status badge colors may not meet WCAG AA contrast requirements.

**Recommendation:** Verify and adjust colors:
- Pending (amber): Verify 4.5:1 contrast
- Reviewed (blue): Verify 4.5:1 contrast

---

## 7. UX/UI Improvements

### 7.1 Empty States - LOW
**Issue:** Generic empty state message could be more helpful.

**Recommendation:** Context-aware empty states:
- "No pending submissions" when filtered to pending
- "No results for 'search term'" when searching

### 7.2 Confirmation Dialogs - MEDIUM
**Issue:** Status changes happen immediately without confirmation.

**Recommendation:** Add confirmation for publish action as it may trigger email notifications.

### 7.3 Keyboard Shortcuts - LOW
**Issue:** No keyboard shortcuts for common actions.

**Recommendation:** Add shortcuts:
- `Esc` - Close modal
- `n` - Next submission
- `p` - Previous submission
- `r` - Mark reviewed
- `u` - Publish

### 7.4 Mobile Experience - MEDIUM
**File:** `app/admin/page.tsx`

**Issues:**
- Table horizontal scrolling on mobile
- Filter dropdowns cramped

**Recommendations:**
- Card-based layout for mobile
- Collapsible filter section
- Bottom sheet for detail view

### 7.5 Print Styles - LOW
**Issue:** No print-specific styling for reports.

**Recommendation:** Add print CSS for detail modal and table views.

---

## 8. Code Quality Improvements

### 8.1 Component Size - MEDIUM
**File:** `app/admin/page.tsx` (1465 lines)

**Recommendation:** Split into smaller components:
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

### 8.2 Type Safety - LOW
**File:** `app/admin/page.tsx:1004`

**Issue:** Status filter uses string union that could drift from API.

**Recommendation:** Import status types from shared location:
```typescript
// types/submission.ts
export const SUBMISSION_STATUSES = ['pending', 'reviewed', 'published'] as const;
export type SubmissionStatus = typeof SUBMISSION_STATUSES[number];
```

### 8.3 Error Boundaries - MEDIUM
**Issue:** No error boundaries to catch runtime errors gracefully.

**Recommendation:** Add error boundaries at route level.

---

## Priority Matrix

| Priority | Category | Items |
|----------|----------|-------|
| **Critical** | Security | 1.1 Password Hashing |
| **High** | Security | 1.2 Setup Key, 1.3 API Auth |
| **High** | Form | 2.1 Client Validation |
| **High** | Admin | 3.1 Pagination, 3.4 Audit Trail |
| **Medium** | Security | 1.4 Token Gen, 1.5 Rate Limiting |
| **Medium** | Form | 2.2 File Upload, 2.3 Persistence, 2.5 Errors |
| **Medium** | Admin | 3.2 Bulk Actions, 3.7 Notes, 3.8 RBAC |
| **Medium** | Testing | 5.1 Coverage, 5.2 Fixtures |
| **Medium** | A11y | 6.1 Focus Management |
| **Medium** | UX | 7.2 Confirmations, 7.4 Mobile |
| **Medium** | Code | 8.1 Component Size, 8.3 Error Boundaries |
| **Low** | Various | Remaining items |

---

## Recommended Next Steps

1. **Immediate (Week 1):**
   - Replace password hashing with bcrypt
   - Move setup key to environment variable
   - Add API-level authentication to admin mutations

2. **Short-term (Weeks 2-3):**
   - Implement client-side form validation
   - Add pagination to admin dashboard
   - Write comprehensive Playwright tests
   - Add audit logging

3. **Medium-term (Weeks 4-6):**
   - Implement bulk actions
   - Add role-based permissions
   - Split admin dashboard into components
   - Improve mobile experience

4. **Long-term:**
   - Add full-text search
   - Implement advanced reporting
   - Add print styling
   - Performance optimization

---

## Appendix: New Test Coverage

See `tests/admin-workflow.spec.ts` for new Playwright tests covering:
- Admin login flow
- Status change workflow
- Delete confirmation flow
- Search and filter combinations
- Form validation scenarios
