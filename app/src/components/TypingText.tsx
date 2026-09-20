import { useEffect, useState } from 'react';

export default function TypingText({
  text,
  speed = 14,
  className,
  onDone,
}: {
  text: string;
  speed?: number;
  className?: string;
  onDone?: () => void;
}) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, speed]);

  return (
    <span className={className}>
      {shown}
      {shown.length < text.length && (
        <span className="ml-0.5 inline-block h-[1em] w-[0.5em] translate-y-[0.12em] animate-pulse bg-acid align-baseline" />
      )}
    </span>
  );
}
