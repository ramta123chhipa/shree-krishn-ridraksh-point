import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onChange }) {
  if (!pages || pages <= 1) return null;

  // Show a window of up to 5 page numbers around the current page
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  const nums = Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
  const btn = 'flex h-10 min-w-10 items-center justify-center rounded-md border px-3 transition-colors';

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button className={`${btn} border-gold-300 hover:bg-cream-100 disabled:opacity-40`} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <ChevronLeft size={18} />
      </button>
      {nums.map((n) => (
        <button key={n} onClick={() => onChange(n)} aria-current={n === page ? 'page' : undefined}
          className={`${btn} ${n === page ? 'border-maroon-700 bg-maroon-700 text-cream-50' : 'border-gold-300 hover:bg-cream-100'}`}>
          {n}
        </button>
      ))}
      <button className={`${btn} border-gold-300 hover:bg-cream-100 disabled:opacity-40`} disabled={page === pages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <ChevronRight size={18} />
      </button>
    </nav>
  );
}
