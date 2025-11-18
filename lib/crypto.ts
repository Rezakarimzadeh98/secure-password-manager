/**
 * Cryptographic utility functions for secure password generation
 * Implements NIST SP 800-63B guidelines
 */

export interface CharacterSet {
  name: string;
  characters: string;
  enabled: boolean;
}

export interface PasswordConfig {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  // Advanced options
  avoidAmbiguous?: boolean;
  requireAllTypes?: boolean;
  noConsecutiveRepeat?: boolean;
  noSequential?: boolean;
}

export interface EntropyResult {
  bits: number;
  score: number;
  label: string;
  color: string;
}

const CHARACTER_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
} as const;

const AMBIGUOUS_CHARS = new Set<string>(['I','l','1','O','0','o']);

function filterAmbiguous(input: string): string {
  let out = '';
  for (const ch of input) {
    if (!AMBIGUOUS_CHARS.has(ch)) out += ch;
  }
  return out;
}

function buildEnabledSets(config: PasswordConfig) {
  const useAmbiguityFilter = !!config.avoidAmbiguous;
  const sets: { key: keyof typeof CHARACTER_SETS; chars: string }[] = [];
  if (config.uppercase) sets.push({ key: 'uppercase', chars: useAmbiguityFilter ? filterAmbiguous(CHARACTER_SETS.uppercase) : CHARACTER_SETS.uppercase });
  if (config.lowercase) sets.push({ key: 'lowercase', chars: useAmbiguityFilter ? filterAmbiguous(CHARACTER_SETS.lowercase) : CHARACTER_SETS.lowercase });
  if (config.numbers) sets.push({ key: 'numbers', chars: useAmbiguityFilter ? filterAmbiguous(CHARACTER_SETS.numbers) : CHARACTER_SETS.numbers });
  if (config.symbols) sets.push({ key: 'symbols', chars: CHARACTER_SETS.symbols });
  return sets.filter(s => s.chars.length > 0);
}

function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) return 0;
  const maxUint = 0xffffffff; // 2^32 - 1
  const limit = Math.floor((maxUint + 1) / maxExclusive) * maxExclusive;
  const buf = new Uint32Array(1);
  while (true) {
    crypto.getRandomValues(buf);
    const val = buf[0];
    if (val < limit) {
      return val % maxExclusive;
    }
  }
}

function secureShuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isSequential(a: string, b: string, c: string): boolean {
  const ca = a.charCodeAt(0);
  const cb = b.charCodeAt(0);
  const cc = c.charCodeAt(0);
  const asc = cb === ca + 1 && cc === cb + 1;
  const desc = cb === ca - 1 && cc === cb - 1;
  return asc || desc;
}

/**
 * Generates a cryptographically secure password using Web Crypto API
 * @param config Password configuration options
 * @returns Generated password string
 */
export function generateSecurePassword(config: PasswordConfig): string {
  const sets = buildEnabledSets(config);
  let combined = sets.map(s => s.chars).join('');

  // Fallback if nothing selected (should be prevented by validation)
  if (combined.length === 0) {
    combined = CHARACTER_SETS.lowercase;
  }

  const requireAll = !!config.requireAllTypes && sets.length > 0;
  const noRepeat = !!config.noConsecutiveRepeat;
  const noSeq = !!config.noSequential;

  const result: string[] = [];

  // Guarantee at least one character from each enabled set
  if (requireAll) {
    for (const s of sets) {
      const idx = secureRandomInt(s.chars.length);
      result.push(s.chars[idx]);
    }
  }

  // Fill remaining characters honoring constraints
  const targetLength = Math.max(0, config.length);
  let safety = 0;
  while (result.length < targetLength) {
    const candidate = combined[secureRandomInt(combined.length)];

    if (noRepeat && result.length > 0 && candidate === result[result.length - 1]) {
      if (++safety > 5000) break; // prevent infinite loop
      continue;
    }

    if (noSeq && result.length > 1) {
      const a = result[result.length - 2];
      const b = result[result.length - 1];
      if (isSequential(a, b, candidate)) {
        if (++safety > 5000) break;
        continue;
      }
    }

    result.push(candidate);
  }

  // Shuffle to avoid predictable placement of guaranteed chars
  const shuffled = secureShuffle(result);
  return shuffled.join('').slice(0, targetLength);
}

/**
 * Calculates Shannon entropy of a given password
 * @param password Password string to analyze
 * @returns Entropy in bits
 */
export function calculateEntropy(password: string): number {
  if (password.length === 0) return 0;
  
  const frequencyMap = new Map<string, number>();
  
  // Calculate character frequencies
  for (const char of password) {
    frequencyMap.set(char, (frequencyMap.get(char) || 0) + 1);
  }
  
  // Shannon entropy calculation: H = -Σ(p(x) * log2(p(x)))
  let entropy = 0;
  const length = password.length;
  
  for (const frequency of frequencyMap.values()) {
    const probability = frequency / length;
    entropy -= probability * Math.log2(probability);
  }
  
  // Return total entropy in bits
  return entropy * password.length;
}

/**
 * Analyzes password strength based on entropy and composition
 * @param password Password to analyze
 * @returns Entropy analysis result
 */
export function analyzePasswordStrength(password: string): EntropyResult {
  const entropy = calculateEntropy(password);
  const length = password.length;
  
  let score = 0;
  
  // Length scoring
  if (length >= 8) score++;
  if (length >= 12) score++;
  if (length >= 16) score++;
  if (length >= 20) score++;
  
  // Character diversity scoring
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  // Entropy scoring
  if (entropy >= 50) score++;
  if (entropy >= 80) score++;
  
  // Determine strength label and color
  let label: string;
  let color: string;
  
  if (score <= 3) {
    label = 'Weak';
    color = 'bg-red-500';
  } else if (score <= 5) {
    label = 'Fair';
    color = 'bg-orange-500';
  } else if (score <= 7) {
    label = 'Good';
    color = 'bg-yellow-500';
  } else if (score <= 9) {
    label = 'Strong';
    color = 'bg-green-500';
  } else {
    label = 'Excellent';
    color = 'bg-emerald-500';
  }
  
  return {
    bits: Math.round(entropy * 10) / 10,
    score,
    label,
    color,
  };
}

/**
 * Estimates password cracking time based on entropy
 * @param entropy Entropy in bits
 * @returns Human-readable time estimate
 */
export function estimateCrackingTime(entropy: number): string {
  const attemptsPerSecond = 1e10; // 10 billion attempts/second (modern GPUs)
  const totalCombinations = Math.pow(2, entropy);
  const seconds = totalCombinations / (2 * attemptsPerSecond); // Average case
  
  const intervals = [
    { label: 'centuries', seconds: 31536000 * 100 },
    { label: 'years', seconds: 31536000 },
    { label: 'months', seconds: 2592000 },
    { label: 'days', seconds: 86400 },
    { label: 'hours', seconds: 3600 },
    { label: 'minutes', seconds: 60 },
    { label: 'seconds', seconds: 1 },
  ];
  
  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}`;
    }
  }
  
  return 'instant';
}
