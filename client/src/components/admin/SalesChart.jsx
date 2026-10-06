import { formatPrice } from '../../utils/formatPrice';

// Daily revenue as bars (plain SVG, no chart library). `data`: [{ date: 'YYYY-MM-DD', revenue, orders }]
export default function SalesChart({ data }) {
  const W = 720, H = 220, PAD = { l: 8, r: 8, t: 12, b: 28 };
  const max = Math.max(...data.map((d) => d.revenue), 1);
  const bw = (W - PAD.l - PAD.r) / data.length;
  const total = data.reduce((n, d) => n + d.revenue, 0);
  const orders = data.reduce((n, d) => n + d.orders, 0);
  const label = (d) => new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Revenue over the last ${data.length} days: ${formatPrice(total)} from ${orders} orders`}>
        <line x1={PAD.l} x2={W - PAD.r} y1={H - PAD.b} y2={H - PAD.b} stroke="#D4A94A" strokeWidth="1" />
        {data.map((d, i) => {
          const h = (d.revenue / max) * (H - PAD.t - PAD.b);
          const x = PAD.l + i * bw + bw * 0.15;
          return (
            <g key={d.date}>
              <rect x={x} y={H - PAD.b - h} width={bw * 0.7} height={Math.max(h, d.revenue ? 2 : 0)} rx="2" fill="#C96A06">
                <title>{`${label(d.date)}: ${formatPrice(d.revenue)} (${d.orders} order${d.orders === 1 ? '' : 's'})`}</title>
              </rect>
              {i % 5 === 0 && <text x={x + bw * 0.35} y={H - 8} textAnchor="middle" fontSize="11" fill="#2A1A14" opacity="0.7">{label(d.date)}</text>}
            </g>
          );
        })}
      </svg>
      <figcaption className="mt-2 text-sm text-ink/70">Last {data.length} days: {formatPrice(total)} from {orders} order{orders === 1 ? '' : 's'}. Highest day {formatPrice(max === 1 ? 0 : max)}.</figcaption>
    </figure>
  );
}
