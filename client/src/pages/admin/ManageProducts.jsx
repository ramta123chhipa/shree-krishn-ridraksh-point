import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader, { linkBtn, primaryBtn } from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import Pagination from '../../components/common/Pagination';
import ProductImage from '../../components/product/ProductImage';
import { useFetch } from '../../hooks/useFetch';
import { deleteProduct, listCategories, listProducts, updateProduct } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';

const sel = 'rounded-md border border-gold-400 bg-white px-3 py-2';
const stockOf = (p) => (p.variants?.length ? p.variants.reduce((n, v) => n + (v.stock || 0), 0) : p.stock);

// Quick stock edit for products without options (products with options are edited on their own page)
function StockCell({ product, onSaved }) {
  const [value, setValue] = useState(String(product.stock));
  const [busy, setBusy] = useState(false);
  if (product.variants?.length) return <span>{stockOf(product)} <span className="text-xs text-ink/60">(options)</span></span>;
  const dirty = value !== String(product.stock);

  const save = async () => {
    setBusy(true);
    try { await updateProduct(product._id, { stock: Number(value) }); toast.success('Stock updated'); onSaved(); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };
  return (
    <span className="flex items-center gap-2">
      <label className="sr-only" htmlFor={`stock-${product._id}`}>Stock for {product.name}</label>
      <input id={`stock-${product._id}`} type="number" min="0" step="1" value={value} onChange={(e) => setValue(e.target.value)} className={`w-20 ${sel} py-1`} />
      {dirty && <button onClick={save} disabled={busy} className={linkBtn}>Save</button>}
    </span>
  );
}

export default function ManageProducts() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const f = { search: params.get('search') || '', category: params.get('category') || '', stock: params.get('stock') || '', status: params.get('status') || '', page: Number(params.get('page')) || 1 };
  const { data, loading, error, reload } = useFetch(() => listProducts(Object.fromEntries(Object.entries(f).filter(([, v]) => v))), [params.toString()]);
  const { data: categories } = useFetch(listCategories);

  const set = (key, value) => { const n = new URLSearchParams(params); if (value) n.set(key, value); else n.delete(key); if (key !== 'page') n.delete('page'); setParams(n); };

  const toggle = async (p, field) => {
    try { await updateProduct(p._id, { [field]: !p[field] }); reload(); } catch (err) { toast.error(err.message); }
  };
  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This also removes its photos and cannot be undone. (To only hide it, edit the product and untick "Visible in the shop".)`)) return;
    try { await deleteProduct(p._id); toast.success('Product deleted'); reload(); } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <PageHeader title="Products"><Link to="/admin/products/new" className={primaryBtn}>Add product</Link></PageHeader>
      <form onSubmit={(e) => { e.preventDefault(); set('search', search.trim()); }} role="search" className="mb-4 flex flex-wrap items-end gap-3">
        <div><label htmlFor="pr-search" className="block text-sm font-medium">Search</label><input id="pr-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name or SKU" className={`${sel} w-56`} /></div>
        <button className={primaryBtn}>Search</button>
        <div><label htmlFor="pr-cat" className="block text-sm font-medium">Category</label>
          <select id="pr-cat" value={f.category} onChange={(e) => set('category', e.target.value)} className={sel}><option value="">All</option>{categories?.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}</select></div>
        <div><label htmlFor="pr-stock" className="block text-sm font-medium">Stock</label>
          <select id="pr-stock" value={f.stock} onChange={(e) => set('stock', e.target.value)} className={sel}><option value="">All</option><option value="low">Running low</option><option value="out">Out of stock</option></select></div>
        <div><label htmlFor="pr-status" className="block text-sm font-medium">Visibility</label>
          <select id="pr-status" value={f.status} onChange={(e) => set('status', e.target.value)} className={sel}><option value="">All</option><option value="active">Visible</option><option value="hidden">Hidden</option></select></div>
      </form>

      {error && <p role="alert" className="mb-3 text-maroon-700">{error}</p>}
      <DataTable caption="Products" loading={loading} rows={data?.data} empty="No products match." columns={[
        { key: 'img', header: '', render: (p) => <div className="h-14 w-14 overflow-hidden rounded"><ProductImage product={p} className="h-14 w-14" /></div> },
        { key: 'name', header: 'Product', render: (p) => (
          <>
            <Link to={`/admin/products/${p._id}`} className="font-medium text-maroon-700 underline">{p.name}</Link>
            <br /><span className="text-sm text-ink/60">{p.sku} · {p.category?.name}</span>
            {!p.isActive && <span className="ml-2 rounded bg-cream-200 px-2 py-0.5 text-xs">Hidden</span>}
          </>) },
        { key: 'price', header: 'Price', render: (p) => (p.discountPrice ? <>{formatPrice(p.discountPrice)} <span className="text-sm text-ink/50 line-through">{formatPrice(p.price)}</span></> : formatPrice(p.price)) },
        { key: 'stock', header: 'Stock', render: (p) => <StockCell key={`${p._id}-${p.stock}`} product={p} onSaved={reload} /> },
        { key: 'flags', header: 'Featured / Best seller', render: (p) => (
          <span className="flex gap-4">
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={!!p.isFeatured} onChange={() => toggle(p, 'isFeatured')} className="accent-maroon-700" aria-label={`Featured: ${p.name}`} /> Featured</label>
            <label className="flex items-center gap-1 text-sm"><input type="checkbox" checked={!!p.isBestSeller} onChange={() => toggle(p, 'isBestSeller')} className="accent-maroon-700" aria-label={`Best seller: ${p.name}`} /> Best</label>
          </span>) },
        { key: 'act', header: 'Actions', render: (p) => <span className="flex gap-3"><Link to={`/admin/products/${p._id}`} className={linkBtn}>Edit</Link><button onClick={() => remove(p)} className={linkBtn}>Delete</button></span> },
      ]} />
      <Pagination page={data?.pagination.page || 1} pages={data?.pagination.pages} onChange={(p) => set('page', String(p))} />
    </>
  );
}
