import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, Boxes, Image, LogOut, Menu, Package, Settings, Store, Tags, Ticket, Users, X } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { SITE_NAME } from '../../utils/constants';

const LINKS = [
  ['/admin', 'Dashboard', BarChart3, true],
  ['/admin/orders', 'Orders', Package],
  ['/admin/products', 'Products', Boxes],
  ['/admin/categories', 'Categories', Tags],
  ['/admin/customers', 'Customers', Users],
  ['/admin/coupons', 'Coupons', Ticket],
  ['/admin/banners', 'Banners', Image],
  ['/admin/settings', 'Settings', Settings],
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => setOpen(false), [pathname]); // close the drawer after choosing a page

  const signOut = async () => { await logout(); navigate('/'); };
  const item = ({ isActive }) => `flex items-center gap-3 rounded-md px-4 py-2.5 ${isActive ? 'bg-saffron-500 text-white' : 'text-cream-100 hover:bg-maroon-800'}`;

  return (
    <div className="min-h-screen bg-cream-100 md:flex">
      <header className="flex items-center justify-between bg-maroon-900 px-4 py-3 text-cream-100 md:hidden">
        <button onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>{open ? <X /> : <Menu />}</button>
        <span className="font-display text-lg font-bold text-gold-300">Admin</span>
        <span className="w-6" />
      </header>

      <aside className={`${open ? 'block' : 'hidden'} w-full shrink-0 bg-maroon-900 md:block md:w-64`} aria-label="Admin menu">
        <div className="hidden px-6 py-6 md:block">
          <p className="font-display text-xl font-bold leading-tight text-gold-300">{SITE_NAME}</p>
          <p className="text-sm text-cream-200/80">Admin dashboard</p>
        </div>
        <nav className="flex flex-col gap-1 px-3 pb-4">
          {LINKS.map(([to, label, Icon, end]) => (
            <NavLink key={to} to={to} end={end} className={item}><Icon size={18} aria-hidden="true" />{label}</NavLink>
          ))}
          <Link to="/" className="mt-4 flex items-center gap-3 rounded-md px-4 py-2.5 text-cream-100 hover:bg-maroon-800"><Store size={18} aria-hidden="true" />View store</Link>
          <button onClick={signOut} className="flex items-center gap-3 rounded-md px-4 py-2.5 text-left text-cream-100 hover:bg-maroon-800"><LogOut size={18} aria-hidden="true" />Log out</button>
        </nav>
        <p className="px-6 pb-6 text-sm text-cream-200/70">Signed in as {user?.name}</p>
      </aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      <Toaster position="top-right" />
    </div>
  );
}
