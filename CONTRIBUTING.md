# Contributing

Thanks for improving Secure Password Manager.

## What to work on

- Bug fixes in password generation, vault flows, and accessibility
- Documentation improvements and security clarifications
- UI polish that keeps the app fast and keyboard-friendly
- Tests for crypto helpers, validation rules, and critical user flows

## Local setup

```bash
git clone https://github.com/Rezakarimzadeh98/secure-password-manager.git
cd secure-password-manager
npm install
npm run dev
```

## Before opening a pull request

```bash
npm test
npm run lint
npm run build
```

## Pull request guidelines

1. Open or reference an issue when the change is non-trivial.
2. Keep each pull request focused on one improvement.
3. Include screenshots for UI changes.
4. Call out any security-sensitive behavior changes explicitly.
5. Update README or supporting docs when behavior changes.

## Suggested first contributions

- Add targeted tests for password strength and generator edge cases
- Improve mobile and keyboard accessibility
- Tighten copy and empty states in the dashboard and vault
- Expand security notes and threat-model documentation

## Reporting bugs

When reporting a bug, include:

- Expected behavior
- Actual behavior
- Reproduction steps
- Browser and OS version
- Screenshots if the problem is visual