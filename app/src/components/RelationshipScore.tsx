import { motion } from 'framer-motion';
import { cn, scoreLabel } from '@/lib/utils';

const LABEL_FILL = {
  Strong: 'bg-mint',
  Medium: 'bg-sun',
  Weak: 'bg-coral',
};

const LABEL_STROKE = {
  Strong: 'text-mint',
  Medium: 'text-sun',
  Weak: 'text-coral',
};

export default function RelationshipScore({
  score,
  size = 88,
  showLabel = true,
  className,
}: {
  score: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}) {
  const label = scoreLabel(score);
  const outline = Math.max(2, Math.round(size * 0.035));
  const band = size * 0.17;
  const radius = (size - band) / 2 - outline;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className={cn('flex shrink-0 flex-col items-center gap-1.5', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          {/* outline ring — the black band that makes it read as a sticker */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--nb-ink)"
            strokeWidth={band + outline * 2}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--nb-sunken)"
            strokeWidth={band}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={band}
            strokeLinecap="butt"
            className={LABEL_STROKE[label]}
            stroke="currentColor"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - score / 100) }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <div
          className="nb-display absolute inset-0 grid place-items-center tabular-nums"
          style={{ fontSize: size * (score >= 100 ? 0.21 : 0.26) }}
        >
          {score}
        </div>
      </div>
      {showLabel && (
        <span className={cn('nb-chip text-onaccent', LABEL_FILL[label])}>{label}</span>
      )}
    </div>
  );
}
