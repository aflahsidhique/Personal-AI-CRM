import { Sparkles } from 'lucide-react';

export default function AISuggestionCard({ text, onClick }: { text: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className="nb-card nb-lift flex w-full items-start gap-3 p-3 text-left sm:p-3.5"
    >
      <span className="nb-b grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-bubble text-onaccent">
        <Sparkles size={14} strokeWidth={2.6} />
      </span>
      <span className="min-w-0 text-sm font-medium">{text}</span>
    </button>
  );
}
