# Examples

## Basic Usage

### Generate a Simple Password

```typescript
import { generateSecurePassword } from '@/lib/crypto';

const password = generateSecurePassword({
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
});

console.log(password); // Example: "Xk9$mP2&nQ5@wL8#"
```

### Analyze Password Strength

```typescript
import { analyzePasswordStrength } from '@/lib/crypto';

const analysis = analyzePasswordStrength('MyP@ssw0rd123');

console.log(analysis);
// {
//   bits: 65.4,
//   score: 7,
//   label: 'Good',
//   color: 'bg-yellow-500'
// }
```

### Estimate Cracking Time

```typescript
import { estimateCrackingTime } from '@/lib/crypto';

const entropy = 128; // bits
const time = estimateCrackingTime(entropy);

console.log(time); // "centuries"
```

## Advanced Usage

### Custom Character Sets

```typescript
import { generateSecurePassword } from '@/lib/crypto';

// Numbers only for PIN
const pin = generateSecurePassword({
  length: 6,
  uppercase: false,
  lowercase: false,
  numbers: true,
  symbols: false,
});

console.log(pin); // Example: "749258"
```

### Validate Configuration

```typescript
import { validateConfig } from '@/lib/utils';

const config = {
  length: 4, // Too short!
  uppercase: false,
  lowercase: false,
  numbers: false,
  symbols: false,
};

const validation = validateConfig(config);
console.log(validation);
// {
//   valid: false,
//   errors: [
//     'Password length must be at least 8 characters',
//     'At least one character type must be selected'
//   ]
// }
```

### Calculate Maximum Entropy

```typescript
import { calculateMaxEntropy } from '@/lib/utils';

const config = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
};

const maxEntropy = calculateMaxEntropy(config);
console.log(maxEntropy); // ~104 bits
```

## Integration Examples

### React Component

```tsx
import { useState } from 'react';
import { generateSecurePassword, analyzePasswordStrength } from '@/lib/crypto';

export function PasswordField() {
  const [password, setPassword] = useState('');
  
  const generate = () => {
    const newPassword = generateSecurePassword({
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    setPassword(newPassword);
  };
  
  const strength = analyzePasswordStrength(password);
  
  return (
    <div>
      <input value={password} readOnly />
      <button onClick={generate}>Generate</button>
      <p>Strength: {strength.label}</p>
    </div>
  );
}
```

### API Route (Next.js)

```typescript
// app/api/generate/route.ts
import { NextResponse } from 'next/server';
import { generateSecurePassword } from '@/lib/crypto';

export async function POST(request: Request) {
  const config = await request.json();
  
  const password = generateSecurePassword(config);
  
  return NextResponse.json({ password });
}
```

### Command Line Tool

```typescript
// cli.ts
import { generateSecurePassword } from './lib/crypto';

const args = process.argv.slice(2);
const length = parseInt(args[0]) || 16;

const password = generateSecurePassword({
  length,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
});

console.log(password);
```

Run with: `ts-node cli.ts 20`

## Security Examples

### Secure Password Storage Pattern

```typescript
import { generateSecurePassword } from '@/lib/crypto';
import bcrypt from 'bcrypt';

async function createUser(username: string) {
  // Generate secure password
  const temporaryPassword = generateSecurePassword({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  
  // Hash before storing
  const hashedPassword = await bcrypt.hash(temporaryPassword, 12);
  
  // Store only hash in database
  await db.users.create({
    username,
    passwordHash: hashedPassword,
  });
  
  // Send temporary password to user securely
  return temporaryPassword;
}
```

### Password Rotation

```typescript
import { generateSecurePassword, analyzePasswordStrength } from '@/lib/crypto';

function generateStrongPassword(): string {
  let password: string;
  let strength;
  
  do {
    password = generateSecurePassword({
      length: 20,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    });
    strength = analyzePasswordStrength(password);
  } while (strength.score < 8); // Ensure minimum strength
  
  return password;
}
```
