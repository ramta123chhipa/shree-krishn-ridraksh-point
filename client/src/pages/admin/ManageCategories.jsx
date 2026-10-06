import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader, { linkBtn, outlineBtn, primaryBtn } from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import FormField, { CheckField, SelectField, TextAreaField } from '../../components/common/FormField';
import { useFetch } from '../../hooks/useFetch';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../../services/adminService';

function CategoryForm({ category, categories, onDone, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { name: category?.name || '', parent: category?.parent || '', description: category?.description || '', sortOrder: category?.sortOrder ?? 0, isActive: category ? category.isActive !== false : true },
  });
  // Only top-level categories can be parents (two levels), and never the category itself
  const parents = categories.filter((c) => !c.parent && c._id !== category?._id);
  const hasChildren = category && categories.some((c) => c.parent === category._id);

  const submit = async (v) => {
    const body = { name: v.name.trim(), parent: v.parent || null, description: v.description.trim(), sortOrder: Number(v.sortOrder) || 0, isActive: v.isActive };
    try {
      if (category) await updateCategory(category._id, body); else await createCategory(body);
      toast.success('Category saved');
      onDone();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="mb-8 grid gap-4 rounded-lg border border-gold-300 bg-white p-5 sm:grid-cols-2">
      <h2 className="text-xl font-semibold sm:col-span-2">{category ? `Edit ${category.name}` : 'New category'}</h2>
      <FormField id="cat-name" label="Name" error={errors.name} {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
      <SelectField id="cat-parent" label="Sits under" disabled={hasChildren} hint={hasChildren ? 'It has sub-categories, so it stays at the top level' : 'Leave empty for a main category'} {...register('parent')}>
        <option value="">(main category)</option>
        {parents.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
      </SelectField>
      <TextAreaField id="cat-desc" label="Description (optional)" rows={2} className="sm:col-span-2" {...register('description')} />
      <FormField id="cat-order" label="Sort order" type="number" step="1" hint="Smaller numbers come first" {...register('sortOrder')} />
      <CheckField id="cat-active" label="Visible in the shop" className="self-center" {...register('isActive')} />
      <div className="flex gap-3 sm:col-span-2">
        <button disabled={isSubmitting} className={primaryBtn}>{isSubmitting ? 'Saving...' : 'Save category'}</button>
        <button type="button" onClick={onCancel} className={outlineBtn}>Cancel</button>
      </div>
    </form>
  );
}

export default function ManageCategories() {
  const { data, loading, error, reload } = useFetch(listCategories);
  const [editing, setEditing] = useState(null); // null | 'new' | category

  const remove = async (c) => {
    if (!window.confirm(`Delete the category "${c.name}"?`)) return;
    try { await deleteCategory(c._id); toast.success('Category deleted'); reload(); } catch (err) { toast.error(err.message); }
  };

  // main categories, each followed by its sub-categories
  const rows = data ? data.filter((c) => !c.parent).flatMap((t) => [{ ...t, depth: 0 }, ...data.filter((c) => c.parent === t._id).map((c) => ({ ...c, depth: 1 }))]) : [];

  return (
    <>
      <PageHeader title="Categories">{!editing && <button onClick={() => setEditing('new')} className={primaryBtn}>Add category</button>}</PageHeader>
      {editing && <CategoryForm key={editing === 'new' ? 'new' : editing._id} category={editing === 'new' ? null : editing} categories={data || []} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); reload(); }} />}
      {error && <p role="alert" className="mb-3 text-maroon-700">{error}</p>}
      <DataTable caption="Categories" loading={loading} rows={rows} empty="No categories yet." columns={[
        { key: 'name', header: 'Category', render: (c) => <span className={c.depth ? 'pl-6 text-ink/80' : 'font-medium'}>{c.depth ? '› ' : ''}{c.name}{!c.isActive && <span className="ml-2 rounded bg-cream-200 px-2 py-0.5 text-xs">Hidden</span>}</span> },
        { key: 'productCount', header: 'Products' },
        { key: 'sortOrder', header: 'Order' },
        { key: 'act', header: 'Actions', render: (c) => <span className="flex gap-3"><button onClick={() => setEditing(c)} className={linkBtn}>Edit</button><button onClick={() => remove(c)} className={linkBtn}>Delete</button></span> },
      ]} />
    </>
  );
}
