type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

interface ScoreGaugeProps {
  grade: Grade;
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const gradeColors: Record<Grade, string> = {
  A: 'bg-score-a',
  B: 'bg-score-b',
  C: 'bg-score-c',
  D: 'bg-score-d',
  F: 'bg-score-f',
};

const sizeDimensions: Record<NonNullable<ScoreGaugeProps['size']>, { container: string; text: string }> = {
  sm: { container: 'w-8 h-8', text: 'text-sm' },
  md: { container: 'w-12 h-12', text: 'text-xl' },
  lg: { container: 'w-16 h-16', text: 'text-2xl' },
};

export function ScoreGauge({ grade, size = 'md' }: ScoreGaugeProps) {
  const { container, text } = sizeDimensions[size];

  return (
    <div
      className={`
        ${container}
        ${gradeColors[grade]}
        rounded-full
        flex items-center justify-center
        shadow-sm
      `}
      role="img"
      aria-label={`Health grade: ${grade}`}
    >
      <span className={`${text} font-bold text-white leading-none`}>
        {grade}
      </span>
    </div>
  );
}
