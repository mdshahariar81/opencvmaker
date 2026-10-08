# Security Policy

## Overview

Security is a core requirement of OpenCVMaker.

OpenCVMaker may process user accounts, CV information, profile images, uploaded files, authentication data, subscription information, and other potentially sensitive application data.

Security vulnerabilities should be reported responsibly.

## Supported Versions

OpenCVMaker is currently under active development.

Security fixes will be applied to actively maintained versions of the project.

| Version | Supported |
|---------|-----------|
| Development / main | Yes |
| Older releases | Depends on maintenance status |

## Reporting a Vulnerability

Please do not publicly disclose a security vulnerability before it has been reviewed and addressed.

When reporting a vulnerability, provide:

- Clear description of the vulnerability
- Steps to reproduce
- Expected behavior
- Actual behavior
- Potential impact
- Affected component or endpoint
- Relevant logs or screenshots when safe to share
- Suggested mitigation, if known

Do not include real user data, passwords, API keys, access tokens, or other secrets in a vulnerability report.

## Security Principles

OpenCVMaker follows these principles:

- Never trust client-side input.
- Validate important data on the server.
- Enforce authorization on the server.
- Keep secrets outside source code.
- Minimize access to sensitive data.
- Store uploaded files securely.
- Apply appropriate rate limits.
- Keep dependencies updated.
- Log security-relevant events appropriately.
- Avoid exposing sensitive information through error messages.

## Authentication

Authentication systems must follow secure practices.

Requirements include:

- Secure password hashing
- Secure session management
- Appropriate session expiration
- Protection against credential abuse
- Email/account verification where required
- Secure password reset flows
- Server-side authentication checks

Authentication decisions must never depend only on frontend state.

## Authorization

Authorization must be enforced on the server.

The application should use role- and permission-based access control.

Example roles may include:

- Guest
- User
- Pro
- Admin
- Owner

Frontend UI restrictions are not considered security boundaries.

## Guest Usage Protection

Guest CV limits must not rely solely on:

- localStorage
- sessionStorage
- frontend state
- client-controlled values

Guest usage tracking must be enforced using server-side mechanisms.

## File Upload Security

Profile images and other uploaded files must be handled securely.

The application should validate:

- File type
- MIME type
- File extension
- File size
- File content where appropriate

Uploaded files should not automatically be treated as trusted content.

Private files should not be exposed through predictable public URLs.

## API Security

API endpoints should use appropriate protections including:

- Authentication
- Authorization
- Input validation
- Rate limiting
- Request size limits
- Secure error handling
- CORS configuration where required
- CSRF protection where applicable
- Abuse prevention

API responses should not expose internal implementation details or sensitive information.

## Input Validation

All user-controlled input must be treated as untrusted.

Important data should be validated at the appropriate application boundaries.

Client-side validation improves user experience but must never replace server-side validation.

## Database Security

Database access must use secure practices.

Requirements include:

- Parameterized queries or safe ORM usage
- Least-privilege database credentials
- Secure database connections
- Migration management
- No database credentials in source code
- Protection against SQL injection
- Appropriate backup and recovery procedures

## Secrets Management

Never commit secrets to Git.

Examples include:

- Database passwords
- API keys
- Authentication secrets
- Payment provider secrets
- Storage credentials
- Email credentials
- AI provider keys
- Webhook secrets
- Private certificates

Use environment variables or an appropriate secrets-management system.

## Environment Variables

Local environment configuration should use:

```text
.env.local