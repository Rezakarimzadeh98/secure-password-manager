'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Copy, RefreshCw, Check, Eye, EyeOff, Settings, X } from 'lucide-react';
import { generateSecurePassword, analyzePasswordStrength, type PasswordConfig } from '@/lib/crypto';
import { PASSWORD_PRESETS } from '@/lib/constants';
import { validateConfig } from '@/lib/utils';

const initialConfig: PasswordConfig = {
  length: 16,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true,
  avoidAmbiguous: true,
  requireAllTypes: true,
  noConsecutiveRepeat: true,
  noSequential: true,
};

export default function PasswordGenerator() {
  const [config, setConfig] = useState<PasswordConfig>(initialConfig);
  const [password, setPassword] = useState(() => generateSecurePassword(initialConfig));
  const [copied, setCopied] = useState(false);
  // Minimal UI with power features behind a modal
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hidden, setHidden] = useState(false);

  const strength = useMemo(() => {
    if (!password) return { bits: 0, score: 0, label: '', color: '' };
    return analyzePasswordStrength(password);
  }, [password]);

  // Minimal UI: no crack time display

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

  const generatePassword = useCallback(() => {
    const newPassword = generateSecurePassword(config);
    setPassword(newPassword);
  }, [config]);

  useEffect(() => {
    setPassword(generateSecurePassword(config));
  }, [config]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
        {/* Password Display Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setHidden(h => !h)}
              className="p-2 rounded hover:bg-gray-100"
              aria-label={hidden ? 'Show password' : 'Hide password'}
              title={hidden ? 'Show' : 'Hide'}
            >
              {hidden ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 mr-2">
                {(['web','banking','wifi','maximum'] as const).map(key => (
                  <button
                    key={key}
                    onClick={() => setConfig(prev => ({ ...prev, ...PASSWORD_PRESETS[key] }))}
                    className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-100"
                    title={PASSWORD_PRESETS[key].name}
                  >
                    {key}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAdvanced(true)}
                className="p-2 rounded hover:bg-gray-100"
                aria-label="Advanced options"
                title="Advanced options"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <input
              type={hidden ? 'password' : 'text'}
              value={password}
              readOnly
              className="w-full px-5 py-4 text-xl font-mono bg-white border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-gray-900 transition-all"
              placeholder="Generating password..."
            />
            <button
              onClick={handleCopyToClipboard}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title={copied ? 'Copied!' : 'Copy to clipboard'}
              aria-label="Copy password"
            >
              {copied ? (
                <Check className="w-5 h-5 text-gray-900" />
              ) : (
                <Copy className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>

          {/* Strength Indicator (minimal) */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">
                  Strength:
                </span>
                <span className={`text-sm font-bold ${
                  strength.label === 'Weak' ? 'text-gray-700' :
                  strength.label === 'Fair' ? 'text-gray-700' :
                  strength.label === 'Good' ? 'text-gray-700' :
                  strength.label === 'Strong' ? 'text-gray-900' :
                  'text-gray-900'
                }`}>
                  {strength.label}
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 bg-gray-900`}
                style={{ width: `${(strength.score / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Configuration Section (minimal) */}
        <div className="p-6 space-y-6">
          {/* Length Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700">
                Length
              </label>
              <span className="text-lg font-bold text-black tabular-nums">
                {config.length}
              </span>
            </div>
            <input
              type="range"
              min="8"
              max="64"
              value={config.length}
              onChange={(e) => updateConfig('length', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-900"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
              <span>8</span>
              <span>16</span>
              <span>32</span>
              <span>64</span>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generatePassword}
            className="w-full bg-black hover:bg-neutral-800 active:bg-neutral-900 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Generate Password
          </button>
          {(() => {
            const v = validateConfig(config);
            if (!v.valid) {
              return <div className="text-xs text-red-600">{v.errors[0]}</div>;
            }
            return null;
          })()}
        </div>
      </div>
      {showAdvanced && (
        <div className="fixed inset-0 bg-black/10 flex items-center justify-center">
          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-lg shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-800">Advanced Options</h2>
              <button onClick={() => setShowAdvanced(false)} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { key: 'uppercase' as const, label: 'Uppercase (A-Z)' },
                { key: 'lowercase' as const, label: 'Lowercase (a-z)' },
                { key: 'numbers' as const, label: 'Numbers (0-9)' },
                { key: 'symbols' as const, label: 'Symbols (!@#$%)' },
              ]).map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <span className="text-sm text-gray-800">{label}</span>
                  <input type="checkbox" checked={config[key]} onChange={(e) => updateConfig(key, e.target.checked)} className="w-5 h-5 accent-gray-900" />
                </label>
              ))}
              {([
                { key: 'avoidAmbiguous' as const, label: 'Avoid ambiguous' },
                { key: 'requireAllTypes' as const, label: 'Require all types' },
                { key: 'noConsecutiveRepeat' as const, label: 'No consecutive repeats' },
                { key: 'noSequential' as const, label: 'No sequences' },
              ]).map(({ key, label }) => (
                <label key={key} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                  <span className="text-sm text-gray-800">{label}</span>
                  <input type="checkbox" checked={Boolean((config as any)[key])} onChange={(e) => updateConfig(key as keyof PasswordConfig, e.target.checked)} className="w-5 h-5 accent-gray-900" />
                </label>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowAdvanced(false)} className="px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-100">Close</button>
              <button onClick={generatePassword} className="px-3 py-2 text-sm text-white bg-black rounded hover:bg-neutral-800">Apply</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
