// Shows the first uploaded image, or a drawn placeholder until real photos are uploaded (Phase 5).
const GEMS = {
  ruby: '#B3122B', manik: '#B3122B', emerald: '#1F8A5B', panna: '#1F8A5B', yellow: '#E6B422',
  pukhraj: '#E6B422', blue: '#1F3FA8', neelam: '#1F3FA8', pearl: '#EFE6D8', moti: '#EFE6D8',
};

function kindOf(product) {
  const text = `${product.name} ${product.category?.name || ''}`.toLowerCase();
  const gem = Object.keys(GEMS).find((k) => text.includes(k));
  if (gem) return { kind: 'gem', color: GEMS[gem] };
  if (text.includes('mala')) return { kind: 'mala' };
  if (text.includes('rudraksh')) return { kind: 'bead' };
  return { kind: 'other' };
}

function Placeholder({ product }) {
  const { kind, color } = kindOf(product);
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full bg-gradient-to-br from-cream-100 to-saffron-50" role="img" aria-label={product.name}>
      <defs>
        <radialGradient id="pb" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#F59A3C" /><stop offset="55%" stopColor="#8A2A1F" /><stop offset="100%" stopColor="#3F0B17" />
        </radialGradient>
      </defs>
      {kind === 'gem' && (
        <g>
          <polygon points="100,40 150,80 100,165 50,80" fill={color} />
          <polygon points="100,40 150,80 100,95 50,80" fill="#fff" opacity=".28" />
          <polygon points="100,95 150,80 100,165" fill="#000" opacity=".18" />
        </g>
      )}
      {kind === 'mala' && Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2;
        return <circle key={i} cx={100 + 55 * Math.cos(a)} cy={90 + 55 * Math.sin(a)} r="9" fill="url(#pb)" />;
      })}
      {kind === 'mala' && <circle cx="100" cy="162" r="13" fill="url(#pb)" />}
      {kind === 'bead' && (
        <g>
          <circle cx="100" cy="100" r="52" fill="url(#pb)" />
          <path d="M100 52v96M78 62c14 24 14 52 0 76M122 62c-14 24-14 52 0 76" stroke="#3F0B17" strokeOpacity=".55" strokeWidth="2.5" fill="none" />
        </g>
      )}
      {kind === 'other' && <circle cx="100" cy="100" r="46" fill="#E8800F" opacity=".85" />}
    </svg>
  );
}

export default function ProductImage({ product, image, className = '' }) {
  const src = image || product.images?.[0]?.url;
  return (
    <div className={`overflow-hidden ${className}`}>
      {src ? <img src={src} alt={product.name} loading="lazy" className="h-full w-full object-cover" /> : <Placeholder product={product} />}
    </div>
  );
}
