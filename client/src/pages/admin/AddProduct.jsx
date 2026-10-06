import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../../components/admin/PageHeader';
import ProductForm from '../../components/admin/ProductForm';
import { NewImagePicker } from '../../components/admin/ImageManager';
import { useFetch } from '../../hooks/useFetch';
import { createProduct, listCategories, uploadProductImages } from '../../services/adminService';

export default function AddProduct() {
  const navigate = useNavigate();
  const { data: categories, loading, error } = useFetch(listCategories);
  const [files, setFiles] = useState([]);

  const save = async (payload) => {
    let product;
    try { product = await createProduct(payload); } catch (err) { toast.error(err.message); return; }

    if (files.length) {
      try { await uploadProductImages(product._id, files); toast.success('Product saved with photos'); }
      catch (err) { toast.error(`Product saved, but the photos did not upload: ${err.message}. Add them on the next page.`, { duration: 8000 }); }
    } else toast.success('Product saved');
    navigate(`/admin/products/${product._id}`, { replace: true });
  };

  if (error) return <p role="alert" className="text-maroon-700">{error}</p>;
  if (loading) return <p>Loading...</p>;
  if (!categories.length) return <p>Create a category first. <Link to="/admin/categories" className="underline">Go to categories</Link></p>;

  return (
    <>
      <Link to="/admin/products" className="text-saffron-600 hover:underline">&larr; All products</Link>
      <PageHeader title="Add product" />
      <ProductForm categories={categories} submitLabel="Add product" onCancel={() => navigate('/admin/products')}
        extra={<NewImagePicker files={files} onChange={setFiles} />} onSubmit={save} />
    </>
  );
}
