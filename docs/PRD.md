# OpenCVMaker — Product Requirements Document

## 1. Product Overview

OpenCVMaker is a modern, open-source CV and resume builder that allows users to create professional CVs through a structured editor, preview changes in real time, select different templates, and export their CVs in multiple formats.

The platform is designed to support:

- Guest users
- Free users
- Pro users
- Admin users
- Owner-level access

The system should be scalable enough to evolve into a hosted SaaS platform while keeping the core project open source.

---

## 2. Product Goals

The main goals are:

1. Make CV creation simple and fast.
2. Provide professional CV templates.
3. Provide real-time preview.
4. Support multiple export formats.
5. Allow users to manage multiple CVs.
6. Provide autosave.
7. Support guest CV creation.
8. Enforce usage limits securely on the server.
9. Keep CV data independent from templates.
10. Build an extensible architecture for future features.

---

## 3. Target Users

### Guest Users

Users who want to create a CV without registering.

### Free Users

Registered users who need a limited number of CVs.

### Pro Users

Users who need higher CV limits, premium templates, and additional features.

### Admin

Users responsible for managing the platform.

### Owner

The project owner with unrestricted platform access.

---

## 4. User Plans

### Guest

- Create 1 CV.
- Edit CV.
- Preview CV.
- Export CV according to available limits.
- Create an account to continue creating additional CVs.
- Guest CV may be transferred to the newly created account.

### Free

- Maximum 3 CVs.
- Standard templates.
- Standard export functionality.
- Dashboard access.

### Pro

Depending on the selected subscription:

- Higher or unlimited CV creation.
- Premium templates.
- Advanced customization.
- Additional export functionality.
- Future AI features.

### Admin / Owner

- Unlimited CV creation.
- Full administrative access.
- No normal user usage restrictions.

All limits must be enforced server-side.

---

## 5. Core Features

## 5.1 CV Creation

Users can create a CV using a step-by-step editor.

Supported sections:

- Personal Information
- Profile Photo
- Professional Summary
- Education
- Work Experience
- Skills
- Projects
- Certifications
- Languages
- Awards
- Volunteer Experience
- Publications
- References
- Interests
- Custom Sections

---

## 5.2 Section Management

Users can:

- Add sections.
- Edit sections.
- Delete sections.
- Hide sections.
- Show sections.
- Reorder sections.

Optional sections can be skipped.

---

## 5.3 Personal Information

Possible fields:

- Full Name
- Job Title
- Email
- Phone
- Location
- Website
- LinkedIn
- GitHub
- Other social/profile links

---

## 5.4 Profile Photo

Profile photo is optional.

Requirements:

- Upload image.
- Validate file type.
- Validate file size.
- Secure storage.
- Replace image.
- Remove image.

---

## 5.5 Education

Each education entry may contain:

- Institution
- Degree
- Field of Study
- Start Date
- End Date
- Current Study Status
- Description
- Grade

Users can add multiple education entries.

---

## 5.6 Work Experience

Each experience entry may contain:

- Company
- Position
- Location
- Start Date
- End Date
- Current Position
- Description
- Responsibilities
- Achievements

Users can add multiple experience entries.

---

## 5.7 Skills

Users can add:

- Skill name
- Skill level
- Optional category

Multiple skills are supported.

---

## 5.8 Projects

Each project may contain:

- Project Name
- Description
- Technologies
- Project URL
- Repository URL
- Start Date
- End Date

---

## 5.9 Additional Sections

The system should support:

- Certifications
- Languages
- Awards
- Volunteer Experience
- Publications
- References
- Interests
- Custom Sections

---

## 6. CV Autosave

CV changes should be automatically saved.

Requirements:

- Save changes without requiring manual submission.
- Prevent unnecessary requests through debouncing.
- Display save status.
- Handle network failures gracefully.
- Prevent accidental data loss.

Possible states:

- Saving
- Saved
- Unsaved changes
- Save failed

---

## 7. Duplicate CV

Users should be able to duplicate an existing CV.

The duplicated CV should:

- Create a new CV ID.
- Copy CV content.
- Allow a new title/name.
- Not overwrite the original CV.

---

## 8. Live Preview

The editor must provide real-time preview.

Preview should update when CV data changes.

The preview should use the same CV schema used by templates.

---

## 9. Full-Screen Preview

The preview system should support:

- Full-screen mode
- Zoom in
- Zoom out
- 100% zoom
- Fit to screen
- Page navigation
- Print
- Download
- Return to editor

---

## 10. Templates

The template system must be modular.

A template should consume the shared CV schema.

Architecture:

CV Data
↓
Shared CV Schema
↓
Template Renderer
↓
Preview / Export

Adding a new template should not require rewriting the CV editor.

---

## 11. Export

Planned formats:

- PDF
- DOCX
- JPG

Export flow:

CV Data
↓
Template
↓
Renderer
↓
Export Engine
↓
File

Export processing may be handled asynchronously for large documents.

---

## 12. Dashboard

Registered users should have:

- My CVs
- Create New CV
- Templates
- Profile
- Subscription
- Settings

Each CV card may display:

- CV title
- Template
- Last updated time
- Created time
- Actions

Possible actions:

- Edit
- Preview
- Duplicate
- Rename
- Export
- Delete

---

## 13. Authentication

The platform should support:

- Registration
- Login
- Logout
- Password reset
- Email verification where required
- Session management

Authentication must be enforced server-side.

---

## 14. Guest System

Guest users may create exactly one CV.

Guest usage must not depend only on:

- localStorage
- sessionStorage
- frontend state
- client-controlled values

A server-side guest session and usage tracking system should be used.

Guest CV ownership should be transferable to a registered account where appropriate.

---

## 15. Subscription System

The system should support:

- Free plan
- Pro plan
- Subscription status
- Subscription start date
- Subscription expiry
- Payment provider integration
- Webhook processing

Payment information should not be stored directly unless required and securely implemented.

---

## 16. Admin Panel

Future admin functionality:

- User management
- CV management
- Template management
- Subscription management
- Usage monitoring
- Reports
- System settings
- Security monitoring

Admin permissions must be enforced server-side.

---

## 17. Security Requirements

Security requirements include:

- Server-side validation
- Authentication
- Authorization
- Role-based access control
- Password hashing
- Rate limiting
- Input sanitization
- XSS protection
- SQL injection protection
- Secure file uploads
- File type validation
- File size validation
- Secure storage
- Signed URLs
- CORS configuration
- CSRF protection where applicable
- Secure error handling
- Logging
- Secrets management
- Dependency auditing

---

## 18. Responsive Design

The application must support:

- Mobile
- Tablet
- Laptop
- Desktop

The CV editor and preview should remain usable across supported screen sizes.

---

## 19. Accessibility

The platform should follow accessible design principles.

Requirements include:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Accessible labels
- Proper contrast
- Screen-reader-friendly controls
- Accessible forms

---

## 20. MVP Scope

The first MVP should include:

- Project foundation
- Authentication
- Guest CV
- Free account
- CV editor
- CV schema
- Personal information
- Education
- Work experience
- Skills
- Projects
- Basic additional sections
- Autosave
- Live preview
- One CV template
- PDF export
- Dashboard
- Usage limits

---

## 21. Future Features

Future versions may include:

- Multiple templates
- Premium templates
- Template marketplace
- AI professional summary
- ATS score
- Job description analysis
- Skill-gap analysis
- Job-specific CV optimization
- AI cover letters
- Collaboration
- CV sharing
- Public CV links
- Analytics

---

## 22. Product Principles

OpenCVMaker should prioritize:

- Simplicity
- Security
- Scalability
- Maintainability
- Accessibility
- Performance
- Developer experience
- Open-source principles