import { Link } from 'react-router-dom';
import { FAQS } from '../../utils/constants';

export function FaqList({ items = FAQS }) {
  return (
    <div className="divide-y divide-gold-300/60 rounded-lg border border-gold-300 bg-white">
      {items.map((f) => (
        <details key={f.q} className="group p-5">
          <summary className="cursor-pointer list-none font-medium text-maroon-800 marker:hidden">{f.q}</summary>
          <p className="mt-2 text-ink/80">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export default function FaqSection() {
  return (
    <section className="container-page max-w-3xl py-14">
      <h2 className="section-title text-center">Frequently asked questions</h2>
      <div className="mt-8"><FaqList items={FAQS.slice(0, 4)} /></div>
      <p className="mt-4 text-center"><Link to="/faq" className="text-saffron-600 hover:underline">See all questions</Link></p>
    </section>
  );
}
