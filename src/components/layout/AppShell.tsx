import type { ReactNode } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen min-h-dvh bg-gray-50">
      <Header />
      <main className="flex-1 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
