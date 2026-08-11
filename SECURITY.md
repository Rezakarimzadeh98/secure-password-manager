# Security Policy

## Supported versions

Security fixes are applied to the latest code on the default branch.

## Reporting a vulnerability

Please do not open public issues for security vulnerabilities.

Use one of these paths instead:

1. Open a private GitHub security advisory for this repository.
2. Contact the maintainer directly with a clear reproduction and impact summary.

Include:

- Affected feature or file
- Reproduction steps or proof of concept
- Expected impact
- Any mitigation ideas you already verified

## Scope

This project is client-side and security-sensitive. Reports are especially useful for:

- Weaknesses in password generation rules
- Unsafe storage or exposure of secrets in the UI
- Injection, XSS, or unsafe rendering paths
- Authentication or session handling flaws
- Export or import flows that could leak data