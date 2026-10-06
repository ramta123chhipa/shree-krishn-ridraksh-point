import { useEffect } from 'react';
import { SITE_NAME } from '../../utils/constants';

const setMeta = (attr, key, content) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute('content', content);
};

// Sets the page title, meta description, Open Graph tags and optional JSON-LD structured data.
export default function Seo({ title, description, image, jsonLd }) {
  const ld = jsonLd ? JSON.stringify(jsonLd) : null;

  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Authentic Rudraksh & Gemstones`;
    document.title = fullTitle;
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:type', ld ? 'product' : 'website');
    if (description) { setMeta('name', 'description', description); setMeta('property', 'og:description', description); }
    if (image) setMeta('property', 'og:image', image);

    let script;
    if (ld) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = ld;
      document.head.appendChild(script);
    }
    return () => script?.remove();
  }, [title, description, image, ld]);

  return null;
}
