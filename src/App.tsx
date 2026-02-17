import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from '@/context/AppProvider';
import { AppShell } from '@/components/layout/AppShell';
import { useUser } from '@/hooks/useUser';
import { OnboardingPage } from '@/pages/OnboardingPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ShopPage } from '@/pages/ShopPage';
import { ScanPage } from '@/pages/ScanPage';
import { RewardsPage } from '@/pages/RewardsPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { AchievementsPage } from '@/pages/AchievementsPage';
import { StorePage } from '@/pages/StorePage';
import { ProfilePage } from '@/pages/ProfilePage';

function AppRoutes() {
  const { isOnboarded } = useUser();

  if (!isOnboarded) {
    return <OnboardingPage />;
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/rewards" element={<RewardsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/achievements" element={<AchievementsPage />} />
        <Route path="/stores" element={<StorePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}

export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </HashRouter>
  );
}
