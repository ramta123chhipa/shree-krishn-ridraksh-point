import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader, { outlineBtn } from '../../components/admin/PageHeader';
import ProductForm from '../../components/admin/ProductForm';
import { ProductImages } from '../../components/admin/ImageManager';
import { useFetch } from '../../hooks/useFetch';
import { deleteProduct, getProduct, listCategories, updateProduct } from '../../services/adminService';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: loaded, loading, error } = useFetch(() => Promise.all([getProduct(id), listCategories()]), [id]);
  const [product, setProduct] = useState(null);
  useEffect(() => { if (loaded) setProduct(loaded[0]); }, [loaded]);

  if (error) return <p role="alert" className="text-maroon-700">{error} <Link to="/admin/products" className="underline">Back to products</Link></p>;
  if (loading || !product) return <p>Loading product...</p>;
  const categories = loaded[1];

  const save = async (payload) => {
    try { setProduct(await updateProduct(id, payload)); toast.success('Product saved'); } catch (err) { toast.error(err.message); }
  };

  const remove = async () => {
    if (!window.confirm(`Delete "${product.name}" and its photos? Past orders keep their own copy of the details. To just hide it from the shop, untick "Visible in the shop" instead.`)) return;
    try { await deleteProduct(id); toast.success('Product deleted'); navigate('/admin/products', { replace: true }); } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <Link to="/admin/products" className="text-saffron-600 hover:underline">&larr; All products</Link>
      <PageHeader title={`Edit: ${product.name}`}>
        <a href={`/product/${product.slug}`} target="_blank" rel="noreferrer" className={outlineBtn}>View in shop</a>
        <button onClick={remove} className={outlineBtn}>Delete</button>
      </PageHeader>
      <div className="space-y-6">
        <ProductImages product={product} onChange={setProduct} />
        {/* key makes the form reload its values after a save */}
        <ProductForm key={product.updatedAt} initial={product} categories={categories} submitLabel="Save changes" onSubmit={save} />
      </div>
    </>
  );
}
