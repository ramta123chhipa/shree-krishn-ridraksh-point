import { useState } from 'react';
import ProductImage from './ProductImage';

export default function ProductGallery({ product }) {
  const images = product.images || [];
  const [index, setIndex] = useState(0);

  return (
    <div>
      <ProductImage product={product} image={images[index]?.url} className="aspect-square rounded-lg border border-gold-300/70" />
      {images.length > 1 && (
        <ul className="mt-3 flex gap-3">
          {images.map((img, i) => (
            <li key={img.url}>
              <button onClick={() => setIndex(i)} aria-label={`Show image ${i + 1}`} aria-current={i === index}
                className={`h-16 w-16 overflow-hidden rounded-md border-2 ${i === index ? 'border-maroon-700' : 'border-transparent'}`}>
                <img src={img.url} alt="" loading="lazy" className="h-full w-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
