import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';

export function AppProvider({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
