import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Seo from '../components/common/Seo';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import ProductCard from '../components/product/ProductCard';
import { useWishlist } from '../hooks/useWishlist';
import { useCart } from '../hooks/useCart';

export default function Wishlist() {
  const { items, loading, remove } = useWishlist();
  const { addItem } = useCart();
  const [busyId, setBusyId] = useState(null);

  // Adds one unit to the cart, then takes the product off the wishlist
  const moveToCart = async (product) => {
    setBusyId(product._id);
    try {
      await addItem(product._id, null, 1);
      await remove(product._id);
      toast.success('Moved to cart');
    } catch (err) { toast.error(err.message); }
    finally { setBusyId(null); }
  };

  if (loading) return <Loader label="Loading your wishlist" />;

  return (
    <div className="container-page py-10">
      <Seo title="Your wishlist" />
      <h1 className="text-4xl font-bold">Your wishlist</h1>

      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-ink/70">You have not saved any products yet.</p>
          <Button to="/shop" className="mt-6">Browse products</Button>
        </div>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {items.map((p) => (
            <li key={p._id} className="flex flex-col gap-2">
              <ProductCard product={p} />
              {p.variants?.length > 0 ? (
                <Link to={`/product/${p.slug}`} className="rounded-md border border-maroon-700 py-2 text-center text-maroon-700 hover:bg-maroon-50">Choose options</Link>
              ) : (
                <button onClick={() => moveToCart(p)} disabled={busyId === p._id || p.stock === 0}
                  className="rounded-md bg-saffron-500 py-2 font-medium text-white hover:bg-saffron-600 disabled:cursor-not-allowed disabled:opacity-60">
                  {p.stock === 0 ? 'Out of stock' : busyId === p._id ? 'Moving...' : 'Move to cart'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
