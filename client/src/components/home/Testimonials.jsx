import { SAMPLE_TESTIMONIALS } from '../../utils/constants';

// Shows sample text until the real review system exists (Phase 6).
export default function Testimonials() {
  return (
    <section className="container-page py-14">
      <h2 className="section-title text-center">What customers say</h2>
      <ul className="mt-8 grid gap-6 md:grid-cols-3">
        {SAMPLE_TESTIMONIALS.map((t, i) => (
          <li key={i} className="rounded-lg border border-gold-300 bg-white p-6">
            <p className="text-ink/80">&ldquo;{t.text}&rdquo;</p>
            <p className="mt-4 font-medium text-maroon-800">{t.name}, {t.place}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
