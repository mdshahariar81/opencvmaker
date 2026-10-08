# OpenCVMaker

OpenCVMaker is a modern, open-source CV and resume builder designed to help users create professional resumes quickly, customize them with flexible templates, preview them in real time, and export them in multiple formats.

The project is designed with a scalable architecture so that it can evolve from an open-source CV builder into a hosted SaaS platform, self-hosted application, client-customizable solution, and future career intelligence platform.

---

## 🚧 Project Status

OpenCVMaker is currently under active development.

The project is being built step by step, starting with the core CV builder and foundation architecture.

---

## ✨ Core Features

### CV Builder

- Step-by-step CV creation
- Structured CV sections
- Add, edit, and delete sections
- Show/hide sections
- Reorder sections
- Optional profile photo
- Custom sections
- Auto-save
- Duplicate CV

### Live Preview

- Real-time CV preview
- Full-screen preview
- Zoom in/out
- Fit to screen
- Page navigation
- Print support
- Return to editor

### Templates

- Modular template system
- Multiple CV templates
- Template-specific layouts
- Future template customization
- Future premium templates

### Export

Planned export formats:

- PDF
- DOCX
- JPG

The same CV data should be reusable across preview and export formats.

### Accounts

The platform will support:

- Guest users
- Free accounts
- Pro accounts
- Admin accounts
- Owner access

### Dashboard

Registered users will have access to:

- My CVs
- Create New CV
- Templates
- Profile
- Subscription
- Settings

---

## 📄 CV Sections

OpenCVMaker will support common professional CV sections including:

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

Users will be able to manage sections according to their needs.

---

## 👤 User Plans

### Guest

A guest user can:

- Create one CV
- Edit the CV
- Preview the CV
- Export the CV according to available limits

After using the guest CV allowance, the user will need to create an account to continue creating additional CVs.

Where technically appropriate, the guest CV can be transferred to the newly created account.

### Free

Free registered users can create up to:

**3 CVs**

The exact feature limitations may evolve during development.

### Pro

Pro users will receive higher or unlimited CV limits depending on the selected subscription plan.

Potential Pro features include:

- More CVs
- Premium templates
- Advanced customization
- Additional export features
- Future AI-powered features

### Admin / Owner

Administrative users will have access to management features.

The project Owner will have unrestricted access to the platform and will not be restricted by normal user usage limits.

All important limits and permissions must be enforced on the server side.

---

## 🏗️ Architecture

OpenCVMaker is designed around a separation between CV data, templates, rendering, and export.

```text
                    CV Data
                       │
                       ▼
                Shared CV Schema
                       │
                       ▼
                Template Renderer
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
           Preview    PDF      DOCX/JPG