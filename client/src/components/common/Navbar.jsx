import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Heart, Menu, ShoppingCart, User, X } from 'lucide-react';
import { NAV_LINKS, SITE_NAME } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useSettings } from '../../hooks/useSettings';
import SearchBox from './SearchBox';

function CountBadge({ count }) {
  if (!count) return null;
  return (
    <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-saffron-500 px-1 text-xs font-semibold text-white">
      {count}
    </span>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const settings = useSettings();
  const { cart } = useCart();
  const { items: wishlistItems } = useWishlist();
  const cartCount = cart.itemCount;
  const wishlistCount = wishlistItems.length;

  const linkClass = ({ isActive }) =>
    `py-1 font-medium transition-colors hover:text-saffron-600 ${isActive ? 'text-saffron-600' : 'text-maroon-800'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-gold-300/60 bg-cream-50/95 backdrop-blur">
      {settings && (
        <div className="bg-maroon-800 py-1.5 text-center text-sm text-cream-100">
          Free shipping on orders above Rs. {settings.freeShippingAbove}
        </div>
      )}

      <div className="container-page flex items-center gap-4 py-3">
        <button className="lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? <X /> : <Menu />}
        </button>

        <Link to="/" className="font-display text-xl font-bold leading-tight text-maroon-800 sm:text-2xl">
          {SITE_NAME}
        </Link>

        <div className="ml-auto hidden max-w-md flex-1 md:block">
          <SearchBox id="site-search" />
        </div>

        <div className="ml-auto flex items-center gap-5 md:ml-0">
          {user?.role === 'admin' && <Link to="/admin" className="rounded-md bg-maroon-700 px-3 py-1 text-sm font-medium text-cream-50 hover:bg-maroon-800">Admin</Link>}
          <Link to={user ? '/profile' : '/login'} aria-label={user ? `Account: ${user.name}` : 'Log in'} className="text-maroon-800 hover:text-saffron-600"><User size={22} /></Link>
          <Link to="/wishlist" aria-label={`Wishlist, ${wishlistCount} items`} className="relative text-maroon-800 hover:text-saffron-600">
            <Heart size={22} /><CountBadge count={wishlistCount} />
          </Link>
          <Link to="/cart" aria-label={`Cart, ${cartCount} items`} className="relative text-maroon-800 hover:text-saffron-600">
            <ShoppingCart size={22} /><CountBadge count={cartCount} />
          </Link>
        </div>
      </div>

      <nav aria-label="Main" className="hidden border-t border-gold-300/50 lg:block">
        <ul className="container-page flex gap-8 py-2">
          {NAV_LINKS.map((l) => (
            <li key={l.to}><NavLink to={l.to} end={l.to === '/'} className={linkClass}>{l.label}</NavLink></li>
          ))}
        </ul>
      </nav>

      {open && (
        <nav aria-label="Mobile" className="border-t border-gold-300/50 bg-cream-50 lg:hidden">
          <div className="container-page pt-3 md:hidden">
            <SearchBox id="mobile-search" onDone={() => setOpen(false)} />
          </div>
          <ul className="container-page flex flex-col gap-1 py-3">
            {NAV_LINKS.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.to === '/'} onClick={() => setOpen(false)} className={(s) => `block py-2 ${linkClass(s)}`}>{l.label}</NavLink>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
