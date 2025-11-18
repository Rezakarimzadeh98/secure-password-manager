import PasswordGenerator from '@/components/PasswordGenerator';

export default function Home() {
  return (
    <div className="h-screen bg-white overflow-hidden">
      <main className="h-full flex items-center justify-center">
        <div className="w-full max-w-2xl px-4">
          <header className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-black">Secure Password Generator</h1>
          </header>
          <PasswordGenerator />
        </div>
      </main>
    </div>
  );
}
