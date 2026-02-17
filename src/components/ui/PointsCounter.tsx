import { useState, useEffect, useRef } from 'react';

interface PointsCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<PointsCounterProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
  xl: 'text-4xl',
};

function formatWithCommas(n: number): string {
  return n.toLocaleString('en-US');
}

export function PointsCounter({
  value,
  prefix = '',
  suffix = '',
  size = 'md',
  animate = false,
  className = '',
}: PointsCounterProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);
  const animationRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    if (!animate || previousValue.current === value) {
      setDisplayValue(value);
      previousValue.current = value;
      return;
    }

    const start = previousValue.current;
    const end = value;
    const diff = end - start;
    const duration = Math.min(Math.abs(diff) * 5, 800);
    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);

      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      }
    }

    animationRef.current = requestAnimationFrame(step);
    previousValue.current = value;

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, animate]);

  return (
    <span
      className={`
        font-bold tabular-nums
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {prefix}
      {formatWithCommas(displayValue)}
      {suffix}
    </span>
  );
}
