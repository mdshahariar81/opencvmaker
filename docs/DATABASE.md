
---

# `docs/DATABASE.md`

```markdown
# OpenCVMaker — Database Design

## 1. Database Overview

OpenCVMaker is designed to use PostgreSQL as the primary relational database.

Prisma is planned as the ORM.

The database stores:

- Users
- Authentication data
- CVs
- CV data
- Templates
- Guest sessions
- Usage
- Subscriptions
- Export jobs
- Files
- Administrative data

---

# 2. Core Entities

```text
User
 │
 ├── CV
 ├── Subscription
 ├── Usage
 ├── File
 └── Session

GuestSession
 │
 └── CV

Template
 │
 └── CV

CV
 │
 └── ExportJob