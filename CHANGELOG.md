# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-18

### Added
- Initial release
- CSPRNG-based password generation using Web Crypto API
- Shannon entropy calculation for password strength analysis
- Real-time password strength visualization
- Configurable password length (8-64 characters)
- Multiple character set options (uppercase, lowercase, numbers, symbols)
- Dark mode support
- Responsive design for all screen sizes
- Copy to clipboard functionality
- Entropy-based cracking time estimation
- Comprehensive documentation
- Security policy (SECURITY.md)
- Contributing guidelines (CONTRIBUTING.md)
- Code of conduct (CODE_OF_CONDUCT.md)
- CI/CD pipeline with GitHub Actions
- MIT License
- TypeScript strict mode implementation
- NIST SP 800-63B compliance

### Security
- Client-side only processing (no server communication)
- No password storage or logging
- Cryptographically secure random number generation
- Memory-safe clipboard operations

## [Unreleased]

### Planned
- Password history with local storage
- Export/import configuration presets
- Browser extension version
- Multi-language support
- Advanced entropy visualization
- Password strength training mode
- Batch password generation
- Custom character sets
- Password policy templates
- API for programmatic access
