import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { getSuggestions } from '../../services/productService';
import { formatPrice } from '../../utils/formatPrice';

// Search input with a live suggestions dropdown (waits 250 ms after typing stops).
export default function SearchBox({ id, onDone }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setSuggestions([]); return undefined; }
    let cancelled = false;
    const t = setTimeout(() => {
      getSuggestions(q).then((d) => !cancelled && setSuggestions(d)).catch(() => !cancelled && setSuggestions([]));
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query]);

  // Close the dropdown when clicking elsewhere
  useEffect(() => {
    const onClick = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const submit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    navigate(`/search?q=${encodeURIComponent(q)}`);
    onDone?.();
  };

  const showList = open && suggestions.length > 0;

  return (
    <div ref={wrapRef} className="relative w-full">
      <form onSubmit={submit} role="search" className="flex">
        <label htmlFor={id} className="sr-only">Search products</label>
        <input
          id={id}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
          placeholder="Search Rudraksh, Neelam, mala..."
          autoComplete="off"
          aria-expanded={showList}
          aria-controls={`${id}-list`}
          className="w-full rounded-l-md border border-gold-400 bg-white px-4 py-2 outline-none focus:border-saffron-500"
        />
        <button className="rounded-r-md bg-maroon-700 px-4 text-cream-50 hover:bg-maroon-800" aria-label="Search">
          <Search size={18} />
        </button>
      </form>

      {showList && (
        <ul id={`${id}-list`} className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-md border border-gold-300 bg-white shadow-lg">
          {suggestions.map((s) => (
            <li key={s._id}>
              <Link
                to={`/product/${s.slug}`}
                onClick={() => { setOpen(false); setQuery(''); onDone?.(); }}
                className="flex items-center justify-between gap-3 px-4 py-2.5 hover:bg-cream-100"
              >
                <span className="line-clamp-1">{s.name}</span>
                <span className="shrink-0 text-sm font-medium text-maroon-700">{formatPrice(s.discountPrice ?? s.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
