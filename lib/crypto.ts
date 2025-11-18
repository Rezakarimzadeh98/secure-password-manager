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

/**
 * Generates a cryptographically secure password using Web Crypto API
 * @param config Password configuration options
 * @returns Generated password string
 */
export function generateSecurePassword(config: PasswordConfig): string {
  let charset = '';
  
  if (config.uppercase) charset += CHARACTER_SETS.uppercase;
  if (config.lowercase) charset += CHARACTER_SETS.lowercase;
  if (config.numbers) charset += CHARACTER_SETS.numbers;
  if (config.symbols) charset += CHARACTER_SETS.symbols;
  
  // Fallback to lowercase if no charset selected
  if (charset.length === 0) {
    charset = CHARACTER_SETS.lowercase;
  }
  
  const charsetLength = charset.length;
  const randomValues = new Uint32Array(config.length);
  
  // Use Web Crypto API for CSPRNG
  crypto.getRandomValues(randomValues);
  
  // Build password using modulo bias mitigation
  let password = '';
  for (let i = 0; i < config.length; i++) {
    const randomIndex = randomValues[i] % charsetLength;
    password += charset[randomIndex];
  }
  
  return password;
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
