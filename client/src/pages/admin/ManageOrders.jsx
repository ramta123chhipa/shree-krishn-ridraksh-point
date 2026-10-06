import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader, { primaryBtn } from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { listOrders } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';
import { ORDER_STATUSES } from '../../utils/constants';

const sel = 'rounded-md border border-gold-400 bg-white px-3 py-2';
const payLabel = { pending: 'Pending', paid: 'Paid', failed: 'Failed', refunded: 'Refunded' };

export default function ManageOrders() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const filters = { status: params.get('status') || '', paymentStatus: params.get('paymentStatus') || '', paymentMethod: params.get('paymentMethod') || '', q: params.get('q') || '', page: Number(params.get('page')) || 1 };

  const { data, loading, error } = useFetch(() => listOrders(Object.fromEntries(Object.entries(filters).filter(([, v]) => v))), [params.toString()]);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <>
      <PageHeader title="Orders" />
      <form onSubmit={(e) => { e.preventDefault(); set('q', q.trim()); }} className="mb-4 flex flex-wrap items-end gap-3" role="search">
        <div>
          <label htmlFor="o-search" className="block text-sm font-medium">Search</label>
          <input id="o-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order number, name or email" className={`${sel} w-64`} />
        </div>
        <button className={primaryBtn}>Search</button>
        <div>
          <label htmlFor="o-status" className="block text-sm font-medium">Status</label>
          <select id="o-status" value={filters.status} onChange={(e) => set('status', e.target.value)} className={sel}>
            <option value="">All</option>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="o-pay" className="block text-sm font-medium">Payment</label>
          <select id="o-pay" value={filters.paymentStatus} onChange={(e) => set('paymentStatus', e.target.value)} className={sel}>
            <option value="">All</option>{Object.entries(payLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="o-method" className="block text-sm font-medium">Method</label>
          <select id="o-method" value={filters.paymentMethod} onChange={(e) => set('paymentMethod', e.target.value)} className={sel}>
            <option value="">All</option><option value="razorpay">Online</option><option value="cod">Cash on delivery</option>
          </select>
        </div>
      </form>

      {error && <p role="alert" className="mb-3 text-maroon-700">{error}</p>}
      <DataTable caption="Orders" loading={loading} rows={data?.data} empty="No orders match these filters." columns={[
        { key: 'orderNumber', header: 'Order', render: (o) => <Link to={`/admin/orders/${o._id}`} className="font-medium text-maroon-700 underline">{o.orderNumber}</Link> },
        { key: 'date', header: 'Date', render: (o) => new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
        { key: 'user', header: 'Customer', render: (o) => <>{o.user?.name || 'Deleted user'}<br /><span className="text-sm text-ink/60">{o.user?.email}</span></> },
        { key: 'total', header: 'Total', render: (o) => formatPrice(o.pricing.total) },
        { key: 'pay', header: 'Payment', render: (o) => <>{o.paymentMethod === 'cod' ? 'COD' : 'Online'} · {payLabel[o.paymentStatus]}{o.refundRequired && <span className="block text-sm font-medium text-maroon-700">Refund due</span>}</> },
        { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
      ]} />
      <Pagination page={data?.pagination.page || 1} pages={data?.pagination.pages} onChange={(p) => set('page', String(p))} />
    </>
  );
}
