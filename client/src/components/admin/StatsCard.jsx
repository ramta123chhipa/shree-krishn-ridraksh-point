import { Link } from 'react-router-dom';

// One number on the dashboard. With `to` the whole card is a link.
export default function StatsCard({ label, value, hint, to, tone = 'default' }) {
  const body = (
    <>
      <p className="text-sm font-medium text-ink/70">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${tone === 'warn' ? 'text-maroon-700' : 'text-maroon-800'}`}>{value}</p>
      {hint && <p className="mt-1 text-sm text-ink/60">{hint}</p>}
    </>
  );
  const cls = 'block rounded-lg border border-gold-300 bg-white p-5';
  return to ? <Link to={to} className={`${cls} transition-shadow hover:shadow-md`}>{body}</Link> : <div className={cls}>{body}</div>;
}
