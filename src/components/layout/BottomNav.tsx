import { useLocation, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/', label: 'Home', emoji: '🏠' },
  { path: '/shop', label: 'Shop', emoji: '🛒' },
  { path: '/scan', label: 'Scan', emoji: '📷', isCenter: true },
  { path: '/rewards', label: 'Rewards', emoji: '🎁' },
  { path: '/profile', label: 'Profile', emoji: '👤' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around h-16 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-14 h-14 -mt-5 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl shadow-lg hover:bg-green-600 transition-all active:scale-95"
              >
                {item.emoji}
              </button>
            );
          }
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                isActive ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl">{item.emoji}</span>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
