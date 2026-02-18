import { useUser } from '@/hooks/useUser';
import { usePoints } from '@/hooks/usePoints';

export function Header() {
  const { user } = useUser();
  const { balance } = usePoints();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-lg mx-auto px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🥦</span>
          <h1 className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
            NutriBucks
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
            <span className="text-sm">⭐</span>
            <span className="text-sm font-bold text-green-700">{balance.available.toLocaleString()}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-lg">
            {user.avatar}
          </div>
        </div>
      </div>
    </header>
  );
}
