export const PASSWORD_PRESETS = {
  web: {
    name: 'Web Account',
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  },
  banking: {
    name: 'Banking & Finance',
    length: 24,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  },
  wifi: {
    name: 'WiFi Network',
    length: 20,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: false,
  },
  pin: {
    name: 'PIN Code',
    length: 6,
    uppercase: false,
    lowercase: false,
    numbers: true,
    symbols: false,
  },
  maximum: {
    name: 'Maximum Security',
    length: 32,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  },
} as const;

export type PresetType = keyof typeof PASSWORD_PRESETS;

export const ENTROPY_LEVELS = {
  veryWeak: { threshold: 28, label: 'Very Weak', color: 'text-red-700' },
  weak: { threshold: 36, label: 'Weak', color: 'text-red-600' },
  fair: { threshold: 60, label: 'Fair', color: 'text-orange-600' },
  good: { threshold: 80, label: 'Good', color: 'text-yellow-600' },
  strong: { threshold: 100, label: 'Strong', color: 'text-green-600' },
  excellent: { threshold: Infinity, label: 'Excellent', color: 'text-emerald-600' },
} as const;

export const SECURITY_RECOMMENDATIONS = [
  'Use unique passwords for each account',
  'Enable two-factor authentication when available',
  'Store passwords in a reputable password manager',
  'Change passwords if you suspect a breach',
  'Avoid using personal information in passwords',
  'Do not share passwords via email or messaging',
] as const;

export const NIST_GUIDELINES = {
  minimumLength: 8,
  recommendedLength: 12,
  maximumLength: 64,
  allowedCharacters: /^[\x20-\x7E]+$/,
  description: 'NIST SP 800-63B Digital Identity Guidelines',
} as const;
