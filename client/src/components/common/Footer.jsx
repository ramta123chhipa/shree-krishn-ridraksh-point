import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { CONTACT, SITE_NAME } from '../../utils/constants';

const policyLinks = [
  ['Shipping Policy', '/shipping-policy'],
  ['Return & Refund Policy', '/return-policy'],
  ['Privacy Policy', '/privacy-policy'],
  ['Terms & Conditions', '/terms'],
  ['FAQ', '/faq'],
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-maroon-900 text-cream-100">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <h2 className="font-display text-2xl font-bold text-gold-300">{SITE_NAME}</h2>
          <p className="mt-3 max-w-sm text-cream-200/90">
            Rudraksh, gemstones and malas for daily practice, sourced with care and described honestly.
          </p>
        </div>

        <div>
          <h3 className="font-display text-xl text-gold-300">Information</h3>
          <ul className="mt-3 space-y-2">
            {policyLinks.map(([label, to]) => (
              <li key={to}><Link to={to} className="hover:text-saffron-400">{label}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-xl text-gold-300">Contact</h3>
          <ul className="mt-3 space-y-2">
            <li className="flex items-center gap-2"><Phone size={16} /> {CONTACT.phone}</li>
            <li className="flex items-center gap-2"><Mail size={16} /> {CONTACT.email}</li>
            <li className="flex items-center gap-2"><MapPin size={16} /> {CONTACT.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream-100/15 py-4 text-center text-sm text-cream-200/80">
        &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
