import { Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWishlist } from '../../hooks/useWishlist';
import { useRequireLogin } from '../../hooks/useAuth';

// Heart toggle. With `label` it shows text too (used on the product page).
export default function WishlistButton({ productId, label = false, className = '' }) {
  const { has, add, remove } = useWishlist();
  const requireLogin = useRequireLogin();
  const saved = has(productId);

  const toggle = async (e) => {
    e.preventDefault();
    if (!requireLogin()) return;
    try {
      if (saved) { await remove(productId); toast.success('Removed from wishlist'); }
      else { await add(productId); toast.success('Saved to wishlist'); }
    } catch (err) { toast.error(err.message); }
  };

  return (
    <button type="button" onClick={toggle} aria-pressed={saved} aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex items-center gap-2 ${label ? 'rounded-md border border-maroon-700 px-5 py-3 text-maroon-700 hover:bg-maroon-50' : 'h-9 w-9 justify-center rounded-full bg-white/90 shadow hover:bg-white'} ${className}`}>
      <Heart size={label ? 20 : 18} className={saved ? 'fill-maroon-700 text-maroon-700' : 'text-maroon-700'} aria-hidden="true" />
      {label && (saved ? 'Saved' : 'Add to wishlist')}
    </button>
  );
}
