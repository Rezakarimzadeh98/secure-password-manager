import { PasswordConfig } from './crypto';

/**
 * Validates password configuration
 */
export function validateConfig(config: PasswordConfig): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (config.length < 8) {
    errors.push('Password length must be at least 8 characters');
  }

  if (config.length > 64) {
    errors.push('Password length cannot exceed 64 characters');
  }

  if (!config.uppercase && !config.lowercase && !config.numbers && !config.symbols) {
    errors.push('At least one character type must be selected');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Formats entropy value for display
 */
export function formatEntropy(entropy: number): string {
  return `${Math.round(entropy * 10) / 10} bits`;
}

/**
 * Calculates character space size
 */
export function calculateCharsetSize(config: PasswordConfig): number {
  let size = 0;
  if (config.uppercase) size += 26;
  if (config.lowercase) size += 26;
  if (config.numbers) size += 10;
  if (config.symbols) size += 25;
  return size;
}

/**
 * Calculates maximum possible entropy
 */
export function calculateMaxEntropy(config: PasswordConfig): number {
  const charsetSize = calculateCharsetSize(config);
  return config.length * Math.log2(charsetSize);
}

/**
 * Sanitizes user input
 */
export function sanitizeInput(value: string): string {
  return value.replace(/[<>]/g, '');
}

/**
 * Deep clones a configuration object
 */
export function cloneConfig(config: PasswordConfig): PasswordConfig {
  return { ...config };
}

/**
 * Checks if two configs are equal
 */
export function configsEqual(a: PasswordConfig, b: PasswordConfig): boolean {
  return (
    a.length === b.length &&
    a.uppercase === b.uppercase &&
    a.lowercase === b.lowercase &&
    a.numbers === b.numbers &&
    a.symbols === b.symbols
  );
}
