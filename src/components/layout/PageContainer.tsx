import type { ReactNode } from 'react';

export function PageContainer({
  title,
  subtitle,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`px-5 py-6 max-w-lg mx-auto ${className || ''}`}>
      {title && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
