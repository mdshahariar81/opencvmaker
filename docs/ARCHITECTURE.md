# OpenCVMaker — System Architecture

## 1. Architecture Overview

OpenCVMaker uses a modular architecture where CV data, templates, rendering, export, authentication, and business logic remain separated.

The architecture is designed to support both open-source self-hosting and future SaaS deployment.

---

## 2. High-Level Architecture

```text
                    User
                      │
                      ▼
                Web Application
                      │
                      ▼
                 API Layer
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
   Auth Service   CV Service   Subscription
        │             │             │
        └─────────────┼─────────────┘
                      │
                      ▼
                 PostgreSQL
                      │
             ┌────────┴────────┐
             ▼                 ▼
           Redis          Object Storage
                              │
                              ▼
                       Images / Exports