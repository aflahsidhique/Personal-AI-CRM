import { type ReactNode, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function useCountUp(target: number, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

export default function DashboardCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: ReactNode;
  accent: string;
}) {
  const animated = useCountUp(value);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('nb-card flex min-w-0 items-center gap-3 p-3 text-onaccent sm:p-4', accent)}
    >
      <div className="nb-b grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-ink sm:h-11 sm:w-11">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="nb-display text-2xl tabular-nums sm:text-3xl">{animated}</div>
        <div className="nb-label truncate">{label}</div>
      </div>
    </motion.div>
  );
}
