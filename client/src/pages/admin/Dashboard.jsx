import { Link } from 'react-router-dom';
import PageHeader from '../../components/admin/PageHeader';
import StatsCard from '../../components/admin/StatsCard';
import SalesChart from '../../components/admin/SalesChart';
import DataTable from '../../components/admin/DataTable';
import StatusBadge from '../../components/common/StatusBadge';
import { useFetch } from '../../hooks/useFetch';
import { getDashboard } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(getDashboard);

  if (error) return <div role="alert" className="text-maroon-700">{error} <button onClick={reload} className="underline">Try again</button></div>;
  if (loading || !data) return <p>Loading dashboard...</p>;
  const { stats, lowStock, lowStockThreshold, recentOrders, salesByDay, ordersByStatus } = data;

  return (
    <>
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatsCard label="Total revenue" value={formatPrice(stats.revenue)} hint="Paid orders, not cancelled or returned" />
        <StatsCard label="Orders" value={stats.orders} hint={`${stats.pendingOrders} waiting to be confirmed`} to="/admin/orders?status=Pending" />
        <StatsCard label="Customers" value={stats.customers} to="/admin/customers" />
        <StatsCard label="Products" value={stats.products} to="/admin/products" />
        <StatsCard label="Low-stock products" value={stats.lowStockCount} hint={`${lowStockThreshold} or fewer left`} tone={stats.lowStockCount ? 'warn' : 'default'} to="/admin/products?stock=low" />
      </div>

      <section className="mt-8 rounded-lg border border-gold-300 bg-white p-5" aria-labelledby="sales-h">
        <h2 id="sales-h" className="mb-3 text-2xl font-semibold">Sales overview</h2>
        <SalesChart data={salesByDay} />
      </section>

      {Object.keys(ordersByStatus).length > 0 && (
        <section className="mt-8" aria-labelledby="status-h">
          <h2 id="status-h" className="mb-3 text-2xl font-semibold">Orders by status</h2>
          <ul className="flex flex-wrap gap-2">
            {Object.entries(ordersByStatus).map(([status, n]) => (
              <li key={status}><Link to={`/admin/orders?status=${encodeURIComponent(status)}`} className="flex items-center gap-2 rounded-full border border-gold-300 bg-white py-1 pl-1 pr-3 hover:shadow"><StatusBadge status={status} /> {n}</Link></li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8 grid gap-8 xl:grid-cols-[2fr_1fr]">
        <section aria-labelledby="recent-h">
          <h2 id="recent-h" className="mb-3 text-2xl font-semibold">Recent orders</h2>
          <DataTable caption="Recent orders" rows={recentOrders} empty="No orders yet." columns={[
            { key: 'orderNumber', header: 'Order', render: (o) => <Link to={`/admin/orders/${o._id}`} className="font-medium text-maroon-700 underline">{o.orderNumber}</Link> },
            { key: 'user', header: 'Customer', render: (o) => o.user?.name || 'Deleted user' },
            { key: 'total', header: 'Total', render: (o) => formatPrice(o.pricing.total) },
            { key: 'status', header: 'Status', render: (o) => <StatusBadge status={o.status} /> },
          ]} />
        </section>

        <section aria-labelledby="low-h">
          <h2 id="low-h" className="mb-3 text-2xl font-semibold">Running low</h2>
          {lowStock.length === 0 ? <p className="rounded-lg border border-gold-300 bg-white p-4 text-ink/70">All products are well stocked.</p> : (
            <ul className="divide-y divide-gold-300/50 rounded-lg border border-gold-300 bg-white">
              {lowStock.map((p) => (
                <li key={p._id} className="flex items-center justify-between gap-3 p-3">
                  <Link to={`/admin/products/${p._id}`} className="text-maroon-700 underline">{p.name}</Link>
                  <span className={`shrink-0 font-semibold ${p.stock === 0 ? 'text-maroon-700' : ''}`}>{p.stock === 0 ? 'Out of stock' : `${p.stock} left`}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
