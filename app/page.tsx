import PasswordGenerator from '@/components/PasswordGenerator';

export default function Home() {
  return (
    <div className="h-screen overflow-hidden bg-linear-to-br from-gray-50 to-gray-100">
      <PasswordGenerator />
    </div>
  );
}
