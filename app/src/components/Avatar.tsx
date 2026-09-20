import { cn } from '@/lib/utils';

const PALETTES = ['bg-acid', 'bg-lav', 'bg-coral', 'bg-aqua', 'bg-bubble', 'bg-sun', 'bg-mint'];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const palette = PALETTES[hashString(name) % PALETTES.length];
  const sizes = {
    sm: 'h-9 w-9 text-xs rounded-lg',
    md: 'h-11 w-11 text-sm rounded-xl',
    lg: 'h-14 w-14 text-base rounded-xl',
    xl: 'h-20 w-20 text-2xl rounded-2xl sm:h-24 sm:w-24',
  };
  return (
    <div
      className={cn(
        'nb-b nb-sh grid shrink-0 place-items-center font-bold text-onaccent',
        palette,
        sizes[size],
        className
      )}
    >
      {initials(name)}
    </div>
  );
}
