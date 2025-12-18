# COGM Memorial - Development Roadmap

## High Priority

### 1. Backend Database
- [ ] Replace localStorage with persistent database
- [ ] Implement data models for submissions
- [ ] Add realtime sync for admin dashboard
- [ ] Migrate existing mock data structure

### 2. Admin Authentication
- [ ] Integrate Clerk authentication
- [ ] Protect /admin routes
- [ ] Add role-based access (admin vs viewer)
- [ ] Implement sign-in/sign-out flow

### 3. File Upload Storage
- [ ] Implement cloud file storage
- [ ] Support obituary PDF uploads
- [ ] Support memorial program uploads
- [ ] Add file size/type validation
- [ ] Generate secure download URLs

---

## Medium Priority

### 4. Public Memorial Wall
- [ ] Create /memorials public page
- [ ] Display published memorials only
- [ ] Add search/filter by jurisdiction
- [ ] Individual memorial detail pages
- [ ] Social sharing functionality

### 5. Email Notifications
- [ ] Admin notification on new submission
- [ ] Submitter confirmation email
- [ ] Status change notifications
- [ ] Email templates with branding

### 6. Export Functionality
- [ ] Export submissions as CSV
- [ ] Export individual records as PDF
- [ ] Bulk export with filters
- [ ] Print-friendly views

---

## Nice to Have

### 7. Photo Gallery
- [ ] Multiple photos per memorial
- [ ] Lightbox image viewer
- [ ] Image optimization/compression
- [ ] Drag-and-drop reordering

### 8. Print Memorial Cards
- [ ] Memorial card template
- [ ] PDF generation
- [ ] Custom formatting options
- [ ] Batch printing support

### 9. Search Enhancements
- [ ] Date range filters
- [ ] Jurisdiction dropdown filter
- [ ] Multiple sort options
- [ ] Saved search preferences

### 10. Accessibility Audit
- [ ] ARIA labels throughout
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] WCAG 2.1 AA compliance

---

## Technical Debt

- [ ] Add error boundaries
- [ ] Implement loading states
- [ ] Add form autosave
- [ ] Optimize bundle size
- [ ] Add CI/CD pipeline with tests
