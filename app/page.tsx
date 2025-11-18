import PasswordGenerator from '@/components/PasswordGenerator';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-gray-50 to-zinc-50 dark:from-gray-950 dark:via-slate-900 dark:to-gray-900">
      <main className="container mx-auto px-4 py-16">
        <header className="text-center mb-16 space-y-4">
          <h1 className="text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Secure Password Generator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Enterprise-grade cryptographic password generation implementing NIST SP 800-63B guidelines.
            Generate cryptographically secure passwords with real-time entropy analysis.
          </p>
        </header>
        <PasswordGenerator />
      </main>
    </div>
  );
}
