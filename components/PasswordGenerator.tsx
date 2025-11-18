'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Copy, RefreshCw, Check, Info } from 'lucide-react';
import {
  generateSecurePassword,
  analyzePasswordStrength,
  estimateCrackingTime,
  type PasswordConfig,
} from '@/lib/crypto';

export default function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [config, setConfig] = useState<PasswordConfig>({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [copied, setCopied] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const strength = useMemo(() => {
    if (!password) return { bits: 0, score: 0, label: '', color: '' };
    return analyzePasswordStrength(password);
  }, [password]);

  const crackingTime = useMemo(() => {
    if (!password) return '';
    return estimateCrackingTime(strength.bits);
  }, [password, strength.bits]);

  const generatePassword = useCallback(() => {
    const newPassword = generateSecurePassword(config);
    setPassword(newPassword);
  }, [config]);

  const handleCopyToClipboard = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const updateConfig = (key: keyof PasswordConfig, value: boolean | number) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Password Display Section */}
        <div className="p-8 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <input
              type="text"
              value={password}
              readOnly
              className="w-full px-6 py-5 text-xl font-mono bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Generating password..."
            />
            <button
              onClick={handleCopyToClipboard}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title={copied ? 'Copied!' : 'Copy to clipboard'}
              aria-label="Copy password"
            >
              {copied ? (
                <Check className="w-5 h-5 text-green-600" />
              ) : (
                <Copy className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>

          {/* Strength Indicator */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Strength:
                </span>
                <span className={`text-sm font-bold ${
                  strength.label === 'Weak' ? 'text-red-600' :
                  strength.label === 'Fair' ? 'text-orange-600' :
                  strength.label === 'Good' ? 'text-yellow-600' :
                  strength.label === 'Strong' ? 'text-green-600' :
                  'text-emerald-600'
                }`}>
                  {strength.label}
                </span>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-1"
              >
                <Info className="w-4 h-4" />
                Details
              </button>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${strength.color}`}
                style={{ width: `${(strength.score / 10) * 100}%` }}
              />
            </div>

            {showDetails && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">Entropy</dt>
                    <dd className="text-gray-900 dark:text-white font-mono">{strength.bits} bits</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">Length</dt>
                    <dd className="text-gray-900 dark:text-white font-mono">{password.length} chars</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-medium text-gray-500 dark:text-gray-400">Est. Crack Time</dt>
                    <dd className="text-gray-900 dark:text-white font-mono">{crackingTime}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Configuration Section */}
        <div className="p-8 space-y-6">
          {/* Length Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Length
              </label>
              <span className="text-lg font-bold text-gray-900 dark:text-white tabular-nums">
                {config.length}
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={config.length}
              onChange={(e) => updateConfig('length', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>8</span>
              <span>16</span>
              <span>32</span>
              <span>64</span>
            </div>
          </div>

          {/* Character Set Options */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Character Sets
            </h3>
            
            {[
              { key: 'uppercase' as const, label: 'Uppercase Letters', example: 'A-Z' },
              { key: 'lowercase' as const, label: 'Lowercase Letters', example: 'a-z' },
              { key: 'numbers' as const, label: 'Numbers', example: '0-9' },
              { key: 'symbols' as const, label: 'Symbols', example: '!@#$%^&*' },
            ].map(({ key, label, example }) => (
              <label
                key={key}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {label}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                    {example}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config[key]}
                  onChange={(e) => updateConfig(key, e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 accent-blue-600"
                />
              </label>
            ))}
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePassword}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-4 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Generate Password
          </button>
        </div>
      </div>

      {/* Information Footer */}
      <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Generated using Web Crypto API. All operations are performed client-side.
          <br />
          No data is sent to any server or stored in any way.
        </p>
      </div>
    </div>
  );
}
