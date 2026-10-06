import { BadgeCheck, PackageCheck, Headset, ShieldCheck } from 'lucide-react';

const points = [
  [BadgeCheck, 'Clear product details', 'Mukhi, size, weight and origin listed on every product.'],
  [ShieldCheck, 'Verified where stated', 'Authenticity notes appear only on products we have verified.'],
  [PackageCheck, 'Careful packing', 'Each order is packed to arrive safely.'],
  [Headset, 'Real support', 'Ask us before you buy through the contact page.'],
];

export default function WhyChooseUs() {
  return (
    <section className="bg-cream-100 py-14">
      <div className="container-page">
        <h2 className="section-title text-center">Why choose us</h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map(([Icon, title, text]) => (
            <li key={title} className="rounded-lg bg-white p-6 text-center shadow-sm">
              <Icon className="mx-auto text-saffron-600" size={32} aria-hidden="true" />
              <h3 className="mt-3 text-xl font-semibold">{title}</h3>
              <p className="mt-1 text-ink/70">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
