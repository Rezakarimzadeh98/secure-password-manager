# Security Policy

## Supported Versions

Currently supported versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Security Model

This application implements a client-side only security model:

### Data Processing
- All password generation occurs in the browser
- No network requests are made during generation
- No passwords are transmitted to any server
- No analytics or tracking mechanisms are implemented

### Cryptographic Implementation
- Uses Web Crypto API for CSPRNG
- Implements NIST SP 800-63B guidelines
- Provides Shannon entropy calculation
- Ensures uniform distribution of characters

### Browser Requirements
- Requires modern browser with Web Crypto API support
- Minimum browser versions listed in README
- Does not support legacy browsers lacking crypto.getRandomValues()

## Known Limitations

### Modulo Bias
The current implementation uses modulo operation for character selection. While the bias is negligible for the charset sizes used (26-87 characters), it theoretically exists. For maximum security in critical applications, consider using a rejection sampling method.

### Memory Security
JavaScript does not provide mechanisms for secure memory clearing. Generated passwords remain in memory until garbage collection. For maximum security, close the tab after copying the password.

### Clipboard Security
Clipboard operations may be logged by system clipboard managers or other applications. Clear clipboard after use for sensitive applications.

## Reporting a Vulnerability

### Process

1. **DO NOT** open a public issue for security vulnerabilities
2. Email security details to: [your-security-email@example.com]
3. Include detailed description and steps to reproduce
4. Allow 48 hours for initial response

### What to Include

- Type of vulnerability
- Affected versions
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if available)

### Response Timeline

- Initial response: Within 48 hours
- Vulnerability assessment: Within 1 week
- Fix development: Depends on severity
- Public disclosure: After fix is released

### Severity Classification

**Critical**: Allows arbitrary code execution or complete security bypass
- Response time: 24 hours
- Fix timeline: 1-3 days

**High**: Compromises password generation security
- Response time: 48 hours
- Fix timeline: 3-7 days

**Medium**: UI vulnerabilities or minor security issues
- Response time: 1 week
- Fix timeline: 2-4 weeks

**Low**: Minor issues with limited impact
- Response time: 2 weeks
- Fix timeline: As resources permit

## Security Best Practices for Users

### Password Usage
- Generate unique passwords for each service
- Use maximum length supported by the service
- Enable all character types unless restricted
- Avoid patterns or repetitions

### Storage
- Use a dedicated password manager
- Do not store passwords in plain text
- Do not share passwords via insecure channels

### Environment
- Use HTTPS version of the application
- Avoid using on shared or public computers
- Clear browser cache after generating sensitive passwords
- Keep browser updated to latest version

## Cryptographic Details

### Algorithm Selection
The application uses `crypto.getRandomValues()` which is backed by platform-specific CSPRNG implementations:
- Windows: BCryptGenRandom (CNG)
- macOS/iOS: arc4random
- Linux: getrandom() system call

### Entropy Sources
Browser CSPRNGs use multiple entropy sources:
- Hardware RNG if available
- OS entropy pool
- System state information
- Timing information

## Acknowledgments

Security researchers who have contributed:
- None yet

## Updates

This security policy is reviewed and updated quarterly. Last update: 2025-11-18
