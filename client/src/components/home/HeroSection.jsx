import Button from '../common/Button';

// A mala drawn as SVG: 27 beads on a ring plus the larger guru bead hanging below.
function MalaIllustration() {
  const beads = Array.from({ length: 27 }, (_, i) => {
    const a = (i / 27) * Math.PI * 2 - Math.PI / 2;
    return { x: 210 + 150 * Math.cos(a), y: 200 + 150 * Math.sin(a), key: i };
  });
  return (
    <svg viewBox="0 0 420 470" role="img" aria-label="Illustration of a Rudraksh mala" className="mx-auto w-full max-w-md">
      <defs>
        <radialGradient id="bead" cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#F59A3C" />
          <stop offset="55%" stopColor="#8A2A1F" />
          <stop offset="100%" stopColor="#3F0B17" />
        </radialGradient>
      </defs>
      <circle cx="210" cy="200" r="150" fill="none" stroke="#D4A94A" strokeWidth="2" />
      <line x1="210" y1="350" x2="210" y2="385" stroke="#D4A94A" strokeWidth="2" />
      {beads.map((b) => (
        <g key={b.key}>
          <circle cx={b.x} cy={b.y} r="15" fill="url(#bead)" />
          <path d={`M${b.x - 6} ${b.y - 6} q6 6 0 12 M${b.x + 6} ${b.y - 6} q-6 6 0 12`} stroke="#3F0B17" strokeOpacity=".55" strokeWidth="1.2" fill="none" />
        </g>
      ))}
      <circle cx="210" cy="410" r="26" fill="url(#bead)" />
      <path d="M198 396 q12 14 0 28 M222 396 q-12 14 0 28 M210 390 v40" stroke="#3F0B17" strokeOpacity=".6" strokeWidth="1.5" fill="none" />
      <circle cx="210" cy="378" r="6" fill="#D4A94A" />
    </svg>
  );
}

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-cream-100 via-cream-50 to-saffron-50">
      <div className="container-page grid items-center gap-10 py-14 md:grid-cols-2 md:py-20">
        <div>
          <h1 className="text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Discover the Power of Authentic Rudraksh &amp; Gemstones
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink/80">
            Hand-picked Rudraksh beads, birth gemstones and japa malas, each listed with its mukhi, size and origin so you know exactly what you are buying.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button to="/shop" variant="saffron">Shop Now</Button>
            <Button to="/category/rudraksh-mala" variant="outline">Browse Malas</Button>
          </div>
        </div>
        <MalaIllustration />
      </div>
    </section>
  );
}
