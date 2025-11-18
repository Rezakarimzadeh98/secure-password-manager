import { generateSecurePassword, analyzePasswordStrength } from '@/lib/crypto';

describe('Password Generation', () => {
  test('generates password of correct length', () => {
    const config = {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    };
    
    const password = generateSecurePassword(config);
    expect(password.length).toBe(16);
  });

  test('respects character type constraints', () => {
    const config = {
      length: 20,
      uppercase: false,
      lowercase: true,
      numbers: false,
      symbols: false,
    };
    
    const password = generateSecurePassword(config);
    expect(/^[a-z]+$/.test(password)).toBe(true);
  });

  test('generates different passwords on each call', () => {
    const config = {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    };
    
    const password1 = generateSecurePassword(config);
    const password2 = generateSecurePassword(config);
    expect(password1).not.toBe(password2);
  });
});

describe('Password Strength Analysis', () => {
  test('correctly identifies weak passwords', () => {
    const result = analyzePasswordStrength('pass123');
    expect(result.label).toBe('Weak');
  });

  test('correctly identifies strong passwords', () => {
    const result = analyzePasswordStrength('Xk9$mP2&nQ5@wL8#');
    expect(['Strong', 'Excellent']).toContain(result.label);
  });

  test('calculates entropy for known passwords', () => {
    const result = analyzePasswordStrength('password');
    expect(result.bits).toBeGreaterThan(0);
    expect(result.bits).toBeLessThan(50);
  });
});
