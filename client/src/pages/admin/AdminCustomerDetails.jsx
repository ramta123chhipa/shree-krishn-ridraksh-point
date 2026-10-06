import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader, { outlineBtn } from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useFetch } from '../../hooks/useFetch';
import { getCustomer, setCustomerStatus } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';

export default function AdminCustomerDetails() {
  const { id } = useParams();
  const { data, loading, error, reload } = useFetch(() => getCustomer(id), [id]);
  const [busy, setBusy] = useState(false);

  if (error) return <p role="alert" className="text-maroon-700">{error} <Link to="/admin/customers" className="underline">Back</Link></p>;
  if (loading || !data) return <p>Loading customer...</p>;
  const { user, addresses, orders } = data;

  const toggle = async () => {
    const block = user.isActive;
    if (!window.confirm(block ? `Block ${user.name}? They will be logged out and cannot log in or order.` : `Unblock ${user.name}?`)) return;
    setBusy(true);
    try { await setCustomerStatus(user._id, !block); toast.success(block ? 'Customer blocked' : 'Customer unblocked'); await reload(); }
    catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  return (
    <>
      <Link to="/admin/customers" className="text-saffron-600 hover:underline">&larr; All customers</Link>
      <PageHeader title={user.name}>
        <button onClick={toggle} disabled={busy} className={outlineBtn}>{user.isActive ? 'Block account' : 'Unblock account'}</button>
      </PageHeader>
      <p className="-mt-4 mb-6 text-ink/70">{user.email}{user.phone ? ` · ${user.phone}` : ''} · Joined {new Date(user.createdAt).toLocaleDateString('en-IN')} · {user.isEmailVerified ? 'Email verified' : 'Email not verified'}{!user.isActive && <strong className="text-maroon-700"> · BLOCKED</strong>}</p>

      <h2 className="mb-3 text-2xl font-semibold">Orders</h2>
      <DataTable caption="Customer orders" rows={orders} empty="No orders yet." columns={[
        { key: 'orderNumber', header: 'Order', render: (o) => <Link to={`/admin/orders/${o._id}`} className="font-medium text-maroon-700 underline">{o.orderNumber}</Link> },
        { key: 'date', header: 'Date', render: (o) => new Date(o.createdAt).toLocaleDateString('en-IN') },
        { key: 'total', header: 'Total', render: (o) => formatPrice(o.pricing.total) },
        { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
      ]} />

      <h2 className="mb-3 mt-8 text-2xl font-semibold">Saved addresses</h2>
      {addresses.length === 0 ? <p className="text-ink/70">None saved.</p> : (
        <ul className="grid gap-3 md:grid-cols-2">
          {addresses.map((a) => <li key={a._id} className="rounded-lg border border-gold-300 bg-white p-4 text-sm"><strong>{a.fullName}</strong> ({a.label}){a.isDefault && ' · default'}<br />{a.line1}{a.line2 ? `, ${a.line2}` : ''}, {a.city}, {a.state} {a.pincode}<br />{a.phone}</li>)}
        </ul>
      )}
    </>
  );
}
