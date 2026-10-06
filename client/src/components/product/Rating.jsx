import { Star } from 'lucide-react';

export default function Rating({ average = 0, count = 0, showCount = true }) {
  if (!count) return <span className="text-sm text-ink/50">No reviews yet</span>;
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${average} out of 5 from ${count} reviews`}>
      <span className="flex" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} size={15} className={n <= Math.round(average) ? 'fill-gold-400 text-gold-400' : 'text-gold-300'} />
        ))}
      </span>
      <span className="text-sm text-ink/70">{average.toFixed(1)}{showCount && ` (${count})`}</span>
    </span>
  );
}
