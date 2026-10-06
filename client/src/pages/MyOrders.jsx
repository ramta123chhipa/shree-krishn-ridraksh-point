import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Seo from '../components/common/Seo';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';
import { getMyOrders } from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';

export default function MyOrders() {
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { getMyOrders().then(setOrders).catch((e) => setError(e.message)); }, []);

  if (error) return <p role="alert" className="container-page py-10 text-maroon-700">{error}</p>;
  if (!orders) return <Loader label="Loading your orders" />;

  return (
    <div className="container-page py-10">
      <Seo title="My orders" />
      <h1 className="text-4xl font-bold">My orders</h1>
      {orders.length === 0 ? (
        <div className="py-16 text-center"><p className="text-lg text-ink/70">You have not placed any orders yet.</p><Button to="/shop" className="mt-6">Start shopping</Button></div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((o) => (
            <li key={o._id}>
              <Link to={`/orders/${o._id}`} className="block rounded-lg border border-gold-300 bg-white p-5 transition-shadow hover:shadow-md">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-semibold text-maroon-800">{o.orderNumber}</span>
                  <StatusBadge status={o.status} />
                </div>
                <p className="mt-1 text-sm text-ink/70">{new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {o.items.length} item{o.items.length > 1 ? 's' : ''}</p>
                <p className="mt-1 line-clamp-1 text-ink/80">{o.items.map((i) => i.name).join(', ')}</p>
                <p className="mt-2 font-semibold">{formatPrice(o.pricing.total)}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
