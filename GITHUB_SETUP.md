# GitHub Repository Setup Guide

This guide helps you configure the GitHub repository for optimal visibility and community engagement.

## Step 1: Add Repository Description

Go to: https://github.com/Rezakarimzadeh98/secure-password-generator

Click "⚙️ Settings" or edit the About section:

**Description:**
```
Enterprise-grade cryptographic password generator implementing NIST SP 800-63B guidelines with Next.js, TypeScript, and Web Crypto API
```

**Website:**
```
https://secure-password-generator.vercel.app
```
(Add after deploying to Vercel)

## Step 2: Add Topics

Click "⚙️" next to About section and add these topics:

```
password-generator
cryptography
nextjs
typescript
security
web-crypto-api
password-strength
entropy
csprng
tailwindcss
react
password-manager
nist
cybersecurity
encryption
```

## Step 3: Enable Features

In Repository Settings (https://github.com/Rezakarimzadeh98/secure-password-generator/settings):

### Features to Enable:
- ✅ Issues
- ✅ Preserve this repository (if you want to star it)
- ✅ Sponsorships (if you added FUNDING.yml)
- ✅ Discussions (for Q&A)
- ✅ Projects (for roadmap tracking)
- ✅ Wiki (optional)

### Features to Configure:
- Set default branch to `main` ✓
- Enable automatic deletion of head branches
- Enable branch protection rules (optional for solo projects)

## Step 4: Add Social Preview

Settings > General > Social preview:

1. Click "Edit"
2. Upload a 1280x640px image showing:
   - Project name: "Secure Password Generator"
   - Key features
   - Tech stack badges

## Step 5: Create Labels

Go to: https://github.com/Rezakarimzadeh98/secure-password-generator/labels

Add these labels:
- `good first issue` (green) - Good for newcomers
- `help wanted` (green) - Extra attention needed
- `bug` (red) - Something isn't working
- `enhancement` (blue) - New feature or request
- `documentation` (yellow) - Improvements or additions to documentation
- `security` (red) - Security-related issues
- `performance` (orange) - Performance improvements
- `question` (purple) - Further information requested

## Step 6: Create First Issue (Good First Issue)

Title: "Add password preset buttons for common use cases"

```markdown
## Description
Add quick preset buttons for common password requirements (Web Account, Banking, WiFi, etc.)

## Acceptance Criteria
- [ ] Add preset buttons to UI
- [ ] Implement preset configurations from lib/constants.ts
- [ ] Add tooltips explaining each preset
- [ ] Update tests

## Technical Details
- Use constants from `lib/constants.ts` > `PASSWORD_PRESETS`
- Add button group above password display
- Style with Tailwind CSS matching existing design

## Labels
- good first issue
- enhancement
- help wanted
```

## Step 7: Enable GitHub Actions

Your CI/CD is already configured! Just ensure:
- Go to Actions tab
- Enable workflows if disabled

## Step 8: Add Repository Stats Badges

Add to README.md (optional):

```markdown
![GitHub stars](https://img.shields.io/github/stars/Rezakarimzadeh98/secure-password-generator)
![GitHub forks](https://img.shields.io/github/forks/Rezakarimzadeh98/secure-password-generator)
![GitHub issues](https://img.shields.io/github/issues/Rezakarimzadeh98/secure-password-generator)
![GitHub license](https://img.shields.io/github/license/Rezakarimzadeh98/secure-password-generator)
```

## Step 9: Verify Everything

Check these URLs work:
- Main: https://github.com/Rezakarimzadeh98/secure-password-generator
- Issues: https://github.com/Rezakarimzadeh98/secure-password-generator/issues
- PRs: https://github.com/Rezakarimzadeh98/secure-password-generator/pulls
- Actions: https://github.com/Rezakarimzadeh98/secure-password-generator/actions
- Security: https://github.com/Rezakarimzadeh98/secure-password-generator/security

## Step 10: Deploy to Vercel

1. Go to https://vercel.com
2. Import GitHub repository
3. Configure:
   - Framework: Next.js
   - Root Directory: ./
   - Build Command: npm run build
   - Output Directory: .next
4. Deploy!

After deployment, add the URL to repository About section.

## Checklist

- [ ] Description added
- [ ] Topics added (minimum 5)
- [ ] Issues enabled
- [ ] Discussions enabled (optional)
- [ ] Labels configured
- [ ] First issue created
- [ ] GitHub Actions verified
- [ ] Social preview added (optional)
- [ ] Deployed to Vercel (optional)

## Result

After completing these steps, your repository will:
- Be easily discoverable
- Show up in GitHub search
- Look professional
- Be contribution-ready
- Have clear community guidelines
