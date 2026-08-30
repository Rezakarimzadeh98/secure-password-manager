# Threat model and crypto design

This document answers issue #13: what we protect, what we assume, and why the generator is built the way it is.

## What this app is

A **client-side password generator** in the browser. It is not a cloud password vault, sync service, or account system. Secrets are meant to be created locally and copied by the user.

## Assets

| Asset | Sensitivity | Where it lives |
| --- | --- | --- |
| Generated password | High | Ephemeral UI / clipboard (user-controlled) |
| Generator options (length, charset flags) | Low | Browser state / local preferences |
| Source and static assets | Public | GitHub / Vercel |

There is **no server-side user database** for passwords in the intended design.

## Trust boundaries

```text
[User device]
  Browser JS + Web Crypto API
       |
       | HTTPS (static app only)
       v
[Hosting / CDN]  — serves JS/CSS/HTML; must not receive generated passwords
```

- **Trusted:** user's device, browser `crypto.getRandomValues`, same-origin app code you audited.
- **Untrusted:** extensions, compromised device malware, malicious networks that only see TLS traffic to the static host (they should not see password plaintext if generation stays in-page).
- **Out of scope for this threat model:** physical shoulder-surfing, user reusing the password elsewhere, phishing sites that mimic this UI.

## Threats and mitigations

| Threat | Mitigation in this project |
| --- | --- |
| Weak / predictable RNG | Use Web Crypto `getRandomValues` with rejection sampling for unbiased ints (`secureRandomInt`), not `Math.random` |
| Bias in charset indexing | Rejection sampling against `2^32` modulus |
| Low entropy configs | NIST SP 800-63B-oriented length/charset guidance in UI + entropy estimate helpers |
| Password sent to a server | Generation stays in the browser; no generate API |
| XSS exfiltrating the password | React/Next rendering hygiene; treat any future rich HTML as hostile; CSP if tightened further |
| Ambiguous characters causing user error | Optional `avoidAmbiguous` filter |
| Supply-chain / dependency malware | Lockfile, CI audit, review Dependabot carefully (avoid blind major bumps) |

## Explicit non-goals

- Encrypted cloud backup of passwords  
- Multi-device sync  
- “Unhackable” guarantees on a compromised endpoint  
- Replacing a full password manager

## Crypto design notes (`lib/crypto.ts`)

1. **Charset assembly** from enabled classes (upper/lower/digit/symbol), optional ambiguous filtering.  
2. **Secure random integers** via `crypto.getRandomValues` + rejection sampling.  
3. **Secure shuffle** (Fisher–Yates with secure ints) when arranging required character classes.  
4. **Entropy display** is an estimate for UX, not a formal certification.

## Residual risks

- Browser extensions can often read page DOM/clipboard.  
- Screenshots and screen-sharing leak passwords.  
- Hosting compromise could serve malicious JS; pin and review deploys.  
- Clipboard may retain secrets longer than the user expects (OS-dependent).

## Reporting

Follow [SECURITY.md](../SECURITY.md). Do not file public issues for exploitable flaws.
