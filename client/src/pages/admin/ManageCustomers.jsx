import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader, { primaryBtn } from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/common/Pagination';
import { useFetch } from '../../hooks/useFetch';
import { listCustomers } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';

export default function ManageCustomers() {
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(params.get('q') || '');
  const page = Number(params.get('page')) || 1;
  const { data, loading, error } = useFetch(() => listCustomers({ q: params.get('q') || undefined, page }), [params.toString()]);

  const set = (key, value) => { const n = new URLSearchParams(params); if (value) n.set(key, value); else n.delete(key); if (key !== 'page') n.delete('page'); setParams(n); };

  return (
    <>
      <PageHeader title="Customers" />
      <form onSubmit={(e) => { e.preventDefault(); set('q', q.trim()); }} role="search" className="mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="c-search" className="block text-sm font-medium">Search</label>
          <input id="c-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or email" className="w-64 rounded-md border border-gold-400 bg-white px-3 py-2" />
        </div>
        <button className={primaryBtn}>Search</button>
      </form>
      {error && <p role="alert" className="mb-3 text-maroon-700">{error}</p>}
      <DataTable caption="Customers" loading={loading} rows={data?.data} empty="No customers found." columns={[
        { key: 'name', header: 'Name', render: (c) => <Link to={`/admin/customers/${c._id}`} className="font-medium text-maroon-700 underline">{c.name}</Link> },
        { key: 'email', header: 'Email', render: (c) => <>{c.email}{!c.isEmailVerified && <span className="block text-xs text-ink/60">not verified</span>}</> },
        { key: 'joined', header: 'Joined', render: (c) => new Date(c.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) },
        { key: 'orders', header: 'Orders' },
        { key: 'spent', header: 'Spent', render: (c) => formatPrice(c.spent) },
        { key: 'status', header: 'Account', render: (c) => (c.isActive ? 'Active' : <span className="font-medium text-maroon-700">Blocked</span>) },
      ]} />
      <Pagination page={data?.pagination.page || 1} pages={data?.pagination.pages} onChange={(p) => set('page', String(p))} />
    </>
  );
}
