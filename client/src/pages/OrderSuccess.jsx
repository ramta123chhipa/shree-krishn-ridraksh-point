import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Seo from '../components/common/Seo';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { getOrder } from '../services/orderService';
import { formatPrice } from '../utils/formatPrice';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => { getOrder(id).then(setOrder).catch((e) => setError(e.message)); }, [id]);

  if (error) return <div className="container-page py-20 text-center"><p role="alert" className="text-maroon-700">{error}</p><Button to="/orders" className="mt-6">My orders</Button></div>;
  if (!order) return <Loader />;

  const paid = order.paymentStatus === 'paid';
  return (
    <div className="container-page max-w-xl py-16 text-center">
      <Seo title="Order placed" />
      <CheckCircle2 className="mx-auto text-green-700" size={56} aria-hidden="true" />
      <h1 className="mt-4 text-4xl font-bold">Thank you for your order</h1>
      <p className="mt-2 text-lg">Order number: <strong className="text-maroon-800">{order.orderNumber}</strong></p>
      <p className="mt-3 text-ink/80">
        {order.paymentMethod === 'cod'
          ? `Please keep ${formatPrice(order.pricing.total)} ready to pay in cash on delivery.`
          : paid ? `We received your payment of ${formatPrice(order.pricing.total)}.` : 'We are waiting for your payment to be confirmed.'}
      </p>
      <p className="mt-1 text-ink/80">Delivering to {order.shippingAddress.fullName}, {order.shippingAddress.city}.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button to={`/orders/${order._id}`}>View order</Button>
        <Link to="/shop" className="rounded-md border border-maroon-700 px-6 py-3 text-maroon-700 hover:bg-maroon-50">Continue shopping</Link>
      </div>
    </div>
  );
}
