'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Copy, RefreshCw, Check, Eye, EyeOff, Settings, X, Download, History, Save, Trash2, Lock, Zap, Shield, Clock, Key, BarChart3, AlertTriangle, Info, ChevronRight, Database, User, LogIn, Search, Tag, Globe, Heart } from 'lucide-react';
import { generateSecurePassword, analyzePasswordStrength, type PasswordConfig, type EntropyResult } from '@/lib/crypto';
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

interface SavedPassword {
  id: string;
  password: string;
  label: string;
  category: string;
  createdAt: Date;
  strength: EntropyResult;
  notes?: string;
}

type TabType = 'generator' | 'vault' | 'bulk' | 'analyzer' | 'bank' | 'settings';

interface User {
  email: string;
  name: string;
  createdAt: Date;
}

interface BankPassword {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  category: string;
  tags: string[];
  favorite: boolean;
  lastModified: Date;
  notes?: string;
}

export default function PasswordGenerator() {
  const [activeTab, setActiveTab] = useState<TabType>('generator');
  const [config, setConfig] = useState<PasswordConfig>(initialConfig);
  const [password, setPassword] = useState(() => generateSecurePassword(initialConfig));
  const [copied, setCopied] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [savedPasswords, setSavedPasswords] = useState<SavedPassword[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLabel, setSaveLabel] = useState('');
  const [saveCategory, setSaveCategory] = useState('personal');
  const [saveNotes, setSaveNotes] = useState('');
  const [passwordCount, setPasswordCount] = useState(5);
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);
  const [analyzeText, setAnalyzeText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(false);
  const [autoGenerateInterval, setAutoGenerateInterval] = useState(5);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [bankPasswords, setBankPasswords] = useState<BankPassword[]>([]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [selectedBank, setSelectedBank] = useState<BankPassword | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const strength = useMemo(() => {
    if (!password) return { bits: 0, score: 0, label: '', color: '' };
    return analyzePasswordStrength(password);
  }, [password]);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    setHistory(prev => [newPassword, ...prev.slice(0, 49)]);
  }, [config]);

  const generateBulkPasswords = useCallback(() => {
    const passwords = Array.from({ length: passwordCount }, () => generateSecurePassword(config));
    setBulkPasswords(passwords);
  }, [config, passwordCount]);

  const savePassword = () => {
    if (saveLabel.trim()) {
      const newSaved: SavedPassword = {
        id: Date.now().toString(),
        password,
        label: saveLabel,
        category: saveCategory,
        createdAt: new Date(),
        strength: analyzePasswordStrength(password),
        notes: saveNotes
      };
      setSavedPasswords(prev => [newSaved, ...prev]);
      setShowSaveModal(false);
      setSaveLabel('');
      setSaveCategory('personal');
      setSaveNotes('');
    }
  };

  const deleteSavedPassword = (id: string) => {
    setSavedPasswords(prev => prev.filter(p => p.id !== id));
  };

  const downloadAsText = () => {
    const content = `Password: ${password}\nGenerated: ${new Date().toLocaleString()}\nLength: ${config.length}\nStrength: ${strength.label} (${strength.bits} bits)`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `password-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportBulkPasswords = (format: 'txt' | 'csv' | 'json') => {
    let content = '';
    let filename = `passwords-bulk-${Date.now()}`;
    
    if (format === 'txt') {
      content = bulkPasswords.join('\n');
      filename += '.txt';
    } else if (format === 'csv') {
      content = 'Index,Password,Length,Strength\n' + bulkPasswords.map((pwd, idx) => {
        const str = analyzePasswordStrength(pwd);
        return `${idx + 1},${pwd},${pwd.length},${str.label}`;
      }).join('\n');
      filename += '.csv';
    } else {
      const data = bulkPasswords.map((pwd, idx) => ({
        index: idx + 1,
        password: pwd,
        length: pwd.length,
        strength: analyzePasswordStrength(pwd).label
      }));
      content = JSON.stringify(data, null, 2);
      filename += '.json';
    }
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportVault = () => {
    const data = savedPasswords.map(p => ({
      label: p.label,
      category: p.category,
      password: p.password,
      strength: p.strength.label,
      createdAt: p.createdAt,
      notes: p.notes
    }));
    const content = JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `password-vault-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getVaultStats = () => {
    const total = savedPasswords.length;
    const byCategory = savedPasswords.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const byStrength = savedPasswords.reduce((acc, p) => {
      acc[p.strength.label] = (acc[p.strength.label] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return { total, byCategory, byStrength };
  };

  const handleAuth = () => {
    if (authMode === 'login') {
      const storedUser = localStorage.getItem('user');
      const storedPass = localStorage.getItem('userPassword');
      if (storedUser && storedPass === authPassword) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setShowAuthModal(false);
      } else {
        alert('Invalid credentials');
      }
    } else {
      const newUser: User = {
        email: authEmail,
        name: authName,
        createdAt: new Date()
      };
      localStorage.setItem('user', JSON.stringify(newUser));
      localStorage.setItem('userPassword', authPassword);
      setUser(newUser);
      setIsAuthenticated(true);
      setShowAuthModal(false);
    }
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  const saveToBankPassword = () => {
    if (!selectedBank) return;
    const newBank: BankPassword = {
      ...selectedBank,
      id: Date.now().toString(),
      lastModified: new Date()
    };
    setBankPasswords(prev => [newBank, ...prev]);
    setShowBankModal(false);
    setSelectedBank(null);
  };

  const deleteBankPassword = (id: string) => {
    setBankPasswords(prev => prev.filter(p => p.id !== id));
  };

  const toggleFavorite = (id: string) => {
    setBankPasswords(prev => prev.map(p => 
      p.id === id ? { ...p, favorite: !p.favorite } : p
    ));
  };

  useEffect(() => {
    setPassword(generateSecurePassword(config));
  }, [config]);

  useEffect(() => {
    const saved = localStorage.getItem('savedPasswords');
    const hist = localStorage.getItem('passwordHistory');
    const user = localStorage.getItem('user');
    const bank = localStorage.getItem('bankPasswords');
    if (saved) {
      setSavedPasswords(JSON.parse(saved));
    }
    if (hist) {
      setHistory(JSON.parse(hist));
    }
    if (user) {
      setUser(JSON.parse(user));
      setIsAuthenticated(true);
    }
    if (bank) {
      setBankPasswords(JSON.parse(bank));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('savedPasswords', JSON.stringify(savedPasswords));
  }, [savedPasswords]);

  useEffect(() => {
    localStorage.setItem('passwordHistory', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('bankPasswords', JSON.stringify(bankPasswords));
  }, [bankPasswords]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoGenerate) {
      interval = setInterval(() => {
        generatePassword();
      }, autoGenerateInterval * 1000);
    }
    return () => clearInterval(interval);
  }, [autoGenerate, autoGenerateInterval, generatePassword]);

  const filteredPasswords = savedPasswords.filter(p => 
    p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.notes && p.notes.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredBankPasswords = bankPasswords.filter(p =>
    p.title.toLowerCase().includes(bankSearch.toLowerCase()) ||
    p.username.toLowerCase().includes(bankSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(bankSearch.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(bankSearch.toLowerCase()))
  );

  const vaultStats = getVaultStats();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with Auth */}
      <div className="bg-white shadow-sm border-b-2 border-gray-200 shrink-0">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="w-7 h-7 text-gray-900" />
            <div>
              <h1 className="font-bold text-xl">Password Manager</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Enterprise Security</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="text-sm hidden md:block text-right">
                  <div className="font-semibold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation with Drag Scroll */}
      <div className="bg-white shadow-sm shrink-0 border-b border-gray-200">
        <div 
          className="flex overflow-x-auto cursor-grab active:cursor-grabbing max-w-screen-2xl mx-auto px-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          onMouseDown={(e) => {
            const ele = e.currentTarget;
            const startX = e.pageX - ele.offsetLeft;
            const scrollLeft = ele.scrollLeft;
            
            const onMouseMove = (ev: MouseEvent) => {
              ev.preventDefault();
              const x = ev.pageX - ele.offsetLeft;
              const walk = (x - startX) * 2;
              ele.scrollLeft = scrollLeft - walk;
            };
            
            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove);
              document.removeEventListener('mouseup', onMouseUp);
            };
            
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
          }}
        >
          {[
            { id: 'generator' as TabType, label: 'Generator', icon: Key },
            { id: 'vault' as TabType, label: 'Vault', icon: Database, badge: savedPasswords.length },
            { id: 'bank' as TabType, label: 'Password Bank', icon: Lock, badge: bankPasswords.length, locked: !isAuthenticated },
            { id: 'bulk' as TabType, label: 'Bulk', icon: Zap },
            { id: 'analyzer' as TabType, label: 'Analyzer', icon: BarChart3 },
            { id: 'settings' as TabType, label: 'Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.locked) {
                    setShowAuthModal(true);
                  } else {
                    setActiveTab(tab.id);
                  }
                }}
                className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all whitespace-nowrap relative cursor-pointer select-none ${
                  activeTab === tab.id
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } ${tab.locked ? 'opacity-70' : ''}`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="bg-black text-white text-xs rounded-full min-w-5 h-5 flex items-center justify-center px-1.5">
                    {tab.badge}
                  </span>
                )}
                {tab.locked && <Lock className="w-3 h-3 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-screen-2xl mx-auto">
        {/* GENERATOR TAB */}
        {activeTab === 'generator' && (
          <>
        <div className="p-4 md:p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHidden(h => !h)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-all duration-200 text-black"
                aria-label={hidden ? 'Show password' : 'Hide password'}
                title={hidden ? 'Show' : 'Hide'}
              >
                {hidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center gap-1">
                {(['web','banking','wifi','maximum'] as const).map(key => (
                  <button
                    key={key}
                    onClick={() => setConfig(prev => ({ ...prev, ...PASSWORD_PRESETS[key] }))}
                    className="px-2 py-1 text-xs font-semibold border border-black rounded hover:bg-black hover:text-white transition-all duration-200 text-black"
                    title={PASSWORD_PRESETS[key].name}
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="relative group">
            <div className="flex gap-2 mb-2">
              <textarea
                value={hidden ? '••••••••••••••••' : password}
                readOnly
                rows={2}
                className="flex-1 px-4 py-3 text-base font-mono bg-gray-50 border border-gray-300 rounded-xl text-black focus:outline-none focus:border-gray-400 transition-all resize-none"
                placeholder="Generating password..."
              />
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="p-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all duration-200 shadow-sm"
                  title={copied ? 'Copied!' : 'Copy'}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      setSelectedBank({
                        id: '',
                        title: '',
                        username: '',
                        password: password,
                        category: 'personal',
                        tags: [],
                        favorite: false,
                        lastModified: new Date()
                      });
                      setShowBankModal(true);
                    } else {
                      setShowSaveModal(true);
                    }
                  }}
                  className="p-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all duration-200 shadow-sm"
                  title="Save"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={downloadAsText}
                  className="p-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl transition-all duration-200 shadow-sm"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Strength Indicator */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-black">
                  Password Strength:
                </span>
                <span className={`text-base font-bold px-3 py-1 rounded-full ${
                  strength.label === 'Weak' ? 'text-red-700 bg-red-100' :
                  strength.label === 'Fair' ? 'text-orange-700 bg-orange-100' :
                  strength.label === 'Good' ? 'text-yellow-700 bg-yellow-100' :
                  strength.label === 'Strong' ? 'text-green-700 bg-green-100' :
                  'text-emerald-700 bg-emerald-100'
                }`}>
                  {strength.label}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-black flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  {isMounted ? strength.bits : 0} bits
                </span>
                <span className="text-sm font-medium text-black flex items-center gap-1">
                  <Lock className="w-4 h-4" />
                  {password.length} chars
                </span>
              </div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
              <div
                className={`h-full transition-all duration-500 ${
                  strength.label === 'Weak' ? 'bg-red-500' :
                  strength.label === 'Fair' ? 'bg-orange-500' :
                  strength.label === 'Good' ? 'bg-yellow-500' :
                  strength.label === 'Strong' ? 'bg-green-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${(strength.score / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Configuration Section */}
        <div className="p-4 md:p-6 space-y-4 bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Quick Character Type Toggles */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => updateConfig('uppercase', !config.uppercase)}
                  className={`p-2 rounded-xl font-semibold transition-all text-sm shadow-sm ${
                    config.uppercase ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  A-Z
                </button>
                <button
                  onClick={() => updateConfig('lowercase', !config.lowercase)}
                  className={`p-2 rounded-xl font-semibold transition-all text-sm shadow-sm ${
                    config.lowercase ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  a-z
                </button>
                <button
                  onClick={() => updateConfig('numbers', !config.numbers)}
                  className={`p-2 rounded-xl font-semibold transition-all text-sm shadow-sm ${
                    config.numbers ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  0-9
                </button>
                <button
                  onClick={() => updateConfig('symbols', !config.symbols)}
                  className={`p-2 rounded-xl font-semibold transition-all text-sm shadow-sm ${
                    config.symbols ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  !@#$
                </button>
              </div>

              {/* Length Slider */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-black">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-black">
                    Length
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateConfig('length', Math.max(8, config.length - 1))}
                      className="w-7 h-7 bg-black text-white rounded-lg hover:bg-gray-800 font-bold text-sm"
                    >
                      -
                    </button>
                    <span className="text-xl font-bold text-black tabular-nums bg-white px-3 py-1 rounded-lg border border-black min-w-[60px] text-center">
                      {config.length}
                    </span>
                    <button
                      onClick={() => updateConfig('length', Math.min(128, config.length + 1))}
                      className="w-7 h-7 bg-black text-white rounded-lg hover:bg-gray-800 font-bold text-sm"
                    >
                      +
                    </button>
                  </div>
                </div>
                <input
                  type="range"
                  min="8"
                  max="128"
                  value={config.length}
                  onChange={(e) => updateConfig('length', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                  style={{
                    background: `linear-gradient(to right, #000 0%, #000 ${((config.length - 8) / (128 - 8)) * 100}%, #e5e7eb ${((config.length - 8) / (128 - 8)) * 100}%, #e5e7eb 100%)`
                  }}
                />
                <div className="flex justify-between text-xs font-semibold text-black mt-2">
                  <span>8</span>
                  <span>64</span>
                  <span>128</span>
                </div>
              </div>

              {/* Advanced Options Checkboxes */}
              <div className="space-y-2">
                {([
                  { key: 'avoidAmbiguous' as const, label: 'Avoid Ambiguous', desc: 'Exclude similar chars (0,O,l,1)' },
                  { key: 'requireAllTypes' as const, label: 'Require All Types', desc: 'Include at least one of each' },
                ]).map(({ key, label, desc }) => (
                  <label key={key} className="flex items-start gap-3 p-3 border border-black rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={Boolean(config[key as keyof PasswordConfig])} 
                      onChange={(e) => updateConfig(key, e.target.checked)} 
                      className="w-5 h-5 accent-black cursor-pointer mt-0.5" 
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-black">{label}</div>
                      <div className="text-xs text-gray-600">{desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Generate Button */}
              <button
                onClick={generatePassword}
                className="w-full bg-black hover:bg-gray-800 active:bg-gray-900 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Generate Password
              </button>

              {/* History Quick View */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-black">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-black flex items-center gap-2">
                    <History className="w-4 h-4" />
                    Recent ({history.length})
                  </h3>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {history.slice(0, 4).map((pwd, idx) => (
                    <div key={idx} className="bg-white border border-black rounded p-2 flex items-center justify-between text-xs group">
                      <code className="font-mono truncate flex-1">{pwd.slice(0, 20)}...</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pwd);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1000);
                        }}
                        className="p-1 bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {history.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4">No history yet</p>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-black">
                <h3 className="text-sm font-bold text-black mb-3">Vault Stats</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Saved:</span>
                    <span className="font-bold">{vaultStats.total}</span>
                  </div>
                  {Object.entries(vaultStats.byStrength).map(([strength, count]) => (
                    <div key={strength} className="flex justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded ${
                        strength === 'Weak' ? 'bg-red-100 text-red-700' :
                        strength === 'Fair' ? 'bg-orange-100 text-orange-700' :
                        strength === 'Good' ? 'bg-yellow-100 text-yellow-700' :
                        strength === 'Strong' ? 'bg-green-100 text-green-700' :
                        'bg-emerald-100 text-emerald-700'
                      }`}>{strength}</span>
                      <span className="font-bold">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {(() => {
            const v = validateConfig(config);
            if (!v.valid) {
              return <div className="text-xs text-red-600 mt-2">{v.errors[0]}</div>;
            }
            return null;
          })()}
        </div>
        </>
        )}

        {/* VAULT TAB */}
        {activeTab === 'vault' && (
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Password Vault</h2>
              <button onClick={exportVault} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export All
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border-2 border-black rounded-lg mb-4"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPasswords.map((saved) => (
                <div key={saved.id} className="bg-white border-2 border-black rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-bold text-black">{saved.label}</h3>
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">{saved.category}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      saved.strength.label === 'Weak' ? 'bg-red-100 text-red-700' :
                      saved.strength.label === 'Fair' ? 'bg-orange-100 text-orange-700' :
                      saved.strength.label === 'Good' ? 'bg-yellow-100 text-yellow-700' :
                      saved.strength.label === 'Strong' ? 'bg-green-100 text-green-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {saved.strength.label}
                    </span>
                  </div>
                  <code className="block font-mono text-sm text-gray-600 truncate mb-2">{saved.password}</code>
                  {saved.notes && <p className="text-xs text-gray-500 mb-2">{saved.notes}</p>}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(saved.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(saved.password);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="flex-1 p-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm"
                    >
                      <Copy className="w-4 h-4 mx-auto" />
                    </button>
                    <button
                      onClick={() => deleteSavedPassword(saved.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredPasswords.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No passwords saved yet</p>
              </div>
            )}
          </div>
        )}

        {/* PASSWORD BANK TAB */}
        {activeTab === 'bank' && (
          <div className="p-4 md:p-6">
            {!isAuthenticated ? (
              <div className="text-center py-12">
                <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-2xl font-bold mb-2">Password Bank</h3>
                <p className="text-gray-600 mb-6">Secure encrypted storage for your important passwords</p>
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 font-semibold flex items-center gap-2 mx-auto"
                >
                  <LogIn className="w-5 h-5" />
                  Login to Access Bank
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Password Bank</h2>
                  <button
                    onClick={() => {
                      setSelectedBank({
                        id: '',
                        title: '',
                        username: '',
                        password: '',
                        category: 'personal',
                        tags: [],
                        favorite: false,
                        lastModified: new Date()
                      });
                      setShowBankModal(true);
                    }}
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
                  >
                    <Key className="w-4 h-4" />
                    Add Password
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search passwords..."
                      value={bankSearch}
                      onChange={(e) => setBankSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-lg"
                    />
                  </div>
                  <select className="px-4 py-2 border-2 border-black rounded-lg font-semibold">
                    <option value="all">All Categories</option>
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="finance">Finance</option>
                    <option value="social">Social Media</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredBankPasswords.map((bank) => (
                    <div key={bank.id} className="bg-white border-2 border-black rounded-lg p-4 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-lg">{bank.title}</h3>
                            <button
                              onClick={() => toggleFavorite(bank.id)}
                              className={`p-1 rounded hover:bg-gray-100 ${
                                bank.favorite ? 'text-yellow-500' : 'text-gray-400'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${bank.favorite ? 'fill-current' : ''}`} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                            <User className="w-3 h-3" />
                            <span className="font-mono">{bank.username}</span>
                          </div>
                          {bank.url && (
                            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                              <Globe className="w-3 h-3" />
                              <span className="truncate">{bank.url}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mb-3">
                        <code className="block font-mono text-sm bg-gray-100 p-2 rounded truncate">{'•'.repeat(12)}</code>
                      </div>

                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <span className="text-xs bg-gray-200 px-2 py-1 rounded font-semibold">{bank.category}</span>
                        {bank.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs bg-black text-white px-2 py-1 rounded flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      {bank.notes && (
                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{bank.notes}</p>
                      )}

                      <div className="text-xs text-gray-500 mb-3">
                        <Clock className="w-3 h-3 inline mr-1" />
                        Modified: {new Date(bank.lastModified).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(bank.password);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className="flex-1 p-2 bg-black text-white rounded-lg hover:bg-gray-800 text-sm font-semibold"
                        >
                          Copy Password
                        </button>
                        <button
                          onClick={() => deleteBankPassword(bank.id)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredBankPasswords.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No passwords in bank yet</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* BULK TAB */}
        {activeTab === 'bulk' && (
          <div className="p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-4">Bulk Password Generator</h2>
            
            <div className="bg-gray-50 border-2 border-black rounded-lg p-6 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-semibold">Quantity:</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={passwordCount}
                  onChange={(e) => setPasswordCount(Math.min(1000, Math.max(1, Number(e.target.value))))}
                  className="w-24 px-3 py-2 border-2 border-black rounded-lg text-center font-bold"
                />
                <button
                  onClick={generateBulkPasswords}
                  className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-semibold flex items-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Generate {passwordCount} Passwords
                </button>
              </div>
            </div>

            {bulkPasswords.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm text-gray-600">Generated {bulkPasswords.length} passwords</p>
                  <div className="flex gap-2">
                    <button onClick={() => exportBulkPasswords('txt')} className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 text-sm font-semibold">
                      TXT
                    </button>
                    <button onClick={() => exportBulkPasswords('csv')} className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 text-sm font-semibold">
                      CSV
                    </button>
                    <button onClick={() => exportBulkPasswords('json')} className="px-4 py-2 border-2 border-black rounded-lg hover:bg-gray-100 text-sm font-semibold">
                      JSON
                    </button>
                  </div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg p-4 max-h-96 overflow-y-auto">
                  {bulkPasswords.map((pwd, idx) => (
                    <div key={idx} className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0">
                      <span className="font-bold text-black w-12">{idx + 1}.</span>
                      <code className="font-mono text-sm flex-1">{pwd}</code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(pwd);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1000);
                        }}
                        className="p-2 bg-black text-white rounded-lg hover:bg-gray-800"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ANALYZER TAB */}
        {activeTab === 'analyzer' && (
          <div className="p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-4">Password Strength Analyzer</h2>
            
            <div className="space-y-4">
              <textarea
                placeholder="Enter a password to analyze..."
                value={analyzeText}
                onChange={(e) => setAnalyzeText(e.target.value)}
                className="w-full px-4 py-3 border-2 border-black rounded-lg font-mono h-32"
              />

              {analyzeText && (() => {
                const analysis = analyzePasswordStrength(analyzeText);
                return (
                  <div className="bg-white border-2 border-black rounded-lg p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{analyzeText.length}</div>
                        <div className="text-sm text-gray-600">Characters</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{analysis.bits}</div>
                        <div className="text-sm text-gray-600">Entropy Bits</div>
                      </div>
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${
                          analysis.label === 'Weak' ? 'text-red-600' :
                          analysis.label === 'Fair' ? 'text-orange-600' :
                          analysis.label === 'Good' ? 'text-yellow-600' :
                          analysis.label === 'Strong' ? 'text-green-600' :
                          'text-emerald-600'
                        }`}>{analysis.label}</div>
                        <div className="text-sm text-gray-600">Strength</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold">{analysis.score}/10</div>
                        <div className="text-sm text-gray-600">Score</div>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-6">
                      <div
                        className={`h-full transition-all ${
                          analysis.label === 'Weak' ? 'bg-red-500' :
                          analysis.label === 'Fair' ? 'bg-orange-500' :
                          analysis.label === 'Good' ? 'bg-yellow-500' :
                          analysis.label === 'Strong' ? 'bg-green-500' :
                          'bg-emerald-500'
                        }`}
                        style={{ width: `${(analysis.score / 10) * 100}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-bold flex items-center gap-2">
                          <Check className="w-4 h-4 text-green-600" />
                          Recommendations
                        </h3>
                        <ul className="text-sm space-y-1">
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-0.5" />
                            Use at least 12 characters
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-0.5" />
                            Mix uppercase, lowercase, numbers, and symbols
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-0.5" />
                            Avoid common words and patterns
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-bold flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          Security Tips
                        </h3>
                        <ul className="text-sm space-y-1">
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-0.5" />
                            Never reuse passwords
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-0.5" />
                            Enable two-factor authentication
                          </li>
                          <li className="flex items-start gap-2">
                            <ChevronRight className="w-4 h-4 mt-0.5" />
                            Use a password manager
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="p-4 md:p-6">
            <h2 className="text-2xl font-bold mb-6">Settings & Preferences</h2>
            
            <div className="space-y-6">
              <div className="bg-white border-2 border-black rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Advanced Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {([
                    { key: 'noConsecutiveRepeat' as const, label: 'No Consecutive Repeats', desc: 'Prevent repeated characters' },
                    { key: 'noSequential' as const, label: 'No Sequential Characters', desc: 'Avoid abc, 123 patterns' },
                  ]).map(({ key, label, desc }) => (
                    <label key={key} className="flex items-start gap-3 p-4 border-2 border-black rounded-lg hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={Boolean(config[key as keyof PasswordConfig])} 
                        onChange={(e) => updateConfig(key, e.target.checked)} 
                        className="w-5 h-5 accent-black cursor-pointer mt-0.5" 
                      />
                      <div>
                        <div className="font-semibold">{label}</div>
                        <div className="text-sm text-gray-600">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-white border-2 border-black rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Auto-Generate</h3>
                <label className="flex items-center gap-3 mb-4">
                  <input
                    type="checkbox"
                    checked={autoGenerate}
                    onChange={(e) => setAutoGenerate(e.target.checked)}
                    className="w-5 h-5 accent-black cursor-pointer"
                  />
                  <span className="font-semibold">Enable auto-generate</span>
                </label>
                {autoGenerate && (
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold">Interval (seconds):</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={autoGenerateInterval}
                      onChange={(e) => setAutoGenerateInterval(Number(e.target.value))}
                      className="w-20 px-3 py-2 border-2 border-black rounded-lg text-center font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="bg-white border-2 border-black rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  About
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Version:</strong> 2.0.0 Enterprise</p>
                  <p><strong>Features:</strong> Advanced Password Generation, Vault Management, Bulk Operations, Strength Analysis</p>
                  <p><strong>Security:</strong> Client-side only, no data transmitted</p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>


      {/* Save Password Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white border-2 border-black rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <Save className="w-6 h-6 text-black" />
                Save Password to Vault
              </h2>
              <button onClick={() => setShowSaveModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-black transition-colors" aria-label="Close">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Label*</label>
                <input
                  type="text"
                  value={saveLabel}
                  onChange={(e) => setSaveLabel(e.target.value)}
                  placeholder="e.g., Gmail Account, Bank Login..."
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Category</label>
                <select
                  value={saveCategory}
                  onChange={(e) => setSaveCategory(e.target.value)}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="finance">Finance</option>
                  <option value="social">Social Media</option>
                  <option value="email">Email</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Notes (Optional)</label>
                <textarea
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none h-20 resize-none"
                />
              </div>
              <div className="bg-gray-50 border-2 border-black rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Password to save:</p>
                <code className="font-mono text-sm break-all">{password}</code>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowSaveModal(false)} className="px-5 py-2.5 text-sm font-semibold border-2 border-black rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={savePassword} disabled={!saveLabel.trim()} className="px-5 py-2.5 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">Save to Vault</button>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white border-2 border-black rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <Lock className="w-6 h-6 text-black" />
                {authMode === 'login' ? 'Login' : 'Sign Up'}
              </h2>
              <button onClick={() => setShowAuthModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-black transition-colors" aria-label="Close">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Email*</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  autoFocus
                />
              </div>
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm font-semibold text-black mb-2">Name*</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Password*</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div className="bg-gray-50 border-2 border-black rounded-lg p-3">
                <p className="text-xs text-gray-600">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Your data is stored locally and encrypted
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              <button
                onClick={handleAuth}
                disabled={!authEmail.trim() || !authPassword.trim() || (authMode === 'signup' && !authName.trim())}
                className="w-full px-5 py-3 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {authMode === 'login' ? 'Login' : 'Create Account'}
              </button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  disabled
                  className="flex items-center justify-center px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed"
                  title="Google OAuth - Coming soon"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
                <button
                  disabled
                  className="flex items-center justify-center px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed"
                  title="GitHub OAuth - Coming soon"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </button>
                <button
                  disabled
                  className="flex items-center justify-center px-4 py-2.5 border-2 border-gray-300 rounded-lg bg-gray-50 opacity-60 cursor-not-allowed"
                  title="Microsoft OAuth - Coming soon"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#f25022" d="M1 1h10v10H1z"/>
                    <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                    <path fill="#7fba00" d="M1 13h10v10H1z"/>
                    <path fill="#ffb900" d="M13 13h10v10H13z"/>
                  </svg>
                </button>
              </div>

              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="w-full text-sm text-gray-600 hover:text-black font-semibold pt-2"
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Login'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bank Save Modal */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-white border-2 border-black rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <Key className="w-6 h-6 text-black" />
                Add to Password Bank
              </h2>
              <button onClick={() => setShowBankModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-black transition-colors" aria-label="Close">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Title*</label>
                <input
                  type="text"
                  value={selectedBank?.title || ''}
                  onChange={(e) => setSelectedBank(prev => prev ? { ...prev, title: e.target.value } : null)}
                  placeholder="e.g., Gmail, Bank Account..."
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Username/Email*</label>
                <input
                  type="text"
                  value={selectedBank?.username || ''}
                  onChange={(e) => setSelectedBank(prev => prev ? { ...prev, username: e.target.value } : null)}
                  placeholder="username@example.com"
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">URL (Optional)</label>
                <input
                  type="url"
                  value={selectedBank?.url || ''}
                  onChange={(e) => setSelectedBank(prev => prev ? { ...prev, url: e.target.value } : null)}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Category</label>
                <select
                  value={selectedBank?.category || 'personal'}
                  onChange={(e) => setSelectedBank(prev => prev ? { ...prev, category: e.target.value } : null)}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="finance">Finance</option>
                  <option value="social">Social Media</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="important, work, urgent"
                  onChange={(e) => setSelectedBank(prev => prev ? { ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) } : null)}
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-black mb-2">Notes (Optional)</label>
                <textarea
                  value={selectedBank?.notes || ''}
                  onChange={(e) => setSelectedBank(prev => prev ? { ...prev, notes: e.target.value } : null)}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-2 border-2 border-black rounded-lg focus:outline-none h-20 resize-none"
                />
              </div>
              <div className="bg-gray-50 border-2 border-black rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Password:</p>
                <code className="font-mono text-sm break-all">{selectedBank?.password || ''}</code>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowBankModal(false)} className="px-5 py-2.5 text-sm font-semibold border-2 border-black rounded-lg hover:bg-gray-100 transition-colors">Cancel</button>
              <button onClick={saveToBankPassword} disabled={!selectedBank?.title.trim() || !selectedBank?.username.trim()} className="px-5 py-2.5 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">Save to Bank</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
