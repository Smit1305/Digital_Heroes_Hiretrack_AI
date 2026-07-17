# Security Policy — HireTrack AI

We take the security of HireTrack AI seriously. If you believe you have found a security vulnerability, please report it to us immediately following the guidelines below.

---

## Supported Versions

Only the latest active version receives security updates.

| Version | Supported |
| :--- | :--- |
| **v1.x** | Yes |
| **< v1.0** | No |

---

## Reporting a Vulnerability

**Please do not report security vulnerabilities via public GitHub issues.** 

Instead, report them privately:
1. Send an email to **security@hiretrack.ai**.
2. Include a detailed description of the vulnerability, instructions or proof-of-concept steps to reproduce the issue, and potential impacts.
3. We will acknowledge your report within 48 hours and provide a timeline for coordination and resolution.

---

## Security Practices

Our development team follows strict security hardening rules:
- **Prisma Parameterization**: All DB queries run via parameterized inputs to eliminate SQL injections.
- **Strict Content Security Policy (CSP)**: Bound headers block unverified third-party scripts.
- **RBAC Server Action Gates**: Database writes are strictly protected by server-side permission checks.
- **Strict Input Validation**: Every endpoint payload is validated using Zod schemas.
