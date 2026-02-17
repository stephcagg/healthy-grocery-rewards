interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeClasses: Record<NonNullable<ProgressBarProps['size']>, string> = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
};

const defaultColorClass = 'bg-primary';

export function ProgressBar({
  value,
  max = 100,
  color,
  size = 'md',
  showLabel = false,
  animated = false,
  className = '',
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const isHexColor = color?.startsWith('#');
  const barColorClass = !color
    ? defaultColorClass
    : isHexColor
      ? ''
      : color;

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500">Progress</span>
          <span className="text-xs font-semibold text-gray-700">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      <div
        className={`
          w-full rounded-full bg-gray-200 overflow-hidden
          ${sizeClasses[size]}
        `}
      >
        <div
          className={`
            h-full rounded-full transition-all duration-500 ease-out
            ${barColorClass}
            ${animated ? 'animate-shimmer' : ''}
          `}
          style={{
            width: `${percentage}%`,
            ...(isHexColor ? { backgroundColor: color } : {}),
          }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
