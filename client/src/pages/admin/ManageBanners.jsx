import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader, { linkBtn, outlineBtn, primaryBtn } from '../../components/admin/PageHeader';
import FormField, { CheckField } from '../../components/common/FormField';
import { checkFiles } from '../../components/admin/ImageManager';
import { useFetch } from '../../hooks/useFetch';
import { createBanner, deleteBanner, listBanners, updateBanner } from '../../services/adminService';

function BannerForm({ banner, onDone, onCancel }) {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { title: banner?.title || '', subtitle: banner?.subtitle || '', link: banner?.link || '', sortOrder: banner?.sortOrder ?? 0, isActive: banner ? banner.isActive : true },
  });

  const pick = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const problem = checkFiles([f]);
    setFileError(problem);
    setFile(problem ? null : f);
  };

  const submit = async (v) => {
    if (!banner && !file) { setFileError('Please choose a banner image'); return; }
    const body = { title: v.title.trim(), subtitle: v.subtitle.trim(), link: v.link.trim(), sortOrder: v.sortOrder || 0, isActive: v.isActive, image: file };
    try {
      if (banner) await updateBanner(banner._id, body); else await createBanner(body);
      toast.success('Banner saved');
      onDone();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="mb-8 grid gap-4 rounded-lg border border-gold-300 bg-white p-5 sm:grid-cols-2">
      <h2 className="text-xl font-semibold sm:col-span-2">{banner ? 'Edit banner' : 'New banner'}</h2>
      <FormField id="b-title" label="Title" error={errors.title} {...register('title', { required: 'Title is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
      <FormField id="b-sub" label="Short text (optional)" {...register('subtitle')} />
      <FormField id="b-link" label="Opens this page (optional)" placeholder="/shop?onSale=true" error={errors.link} hint="A page on this site, starting with /"
        {...register('link', { validate: (v) => !v || /^\/(?!\/)[\w\-./?=&%#]*$/.test(v) || 'Must start with / and stay on this site' })} />
      <FormField id="b-order" label="Sort order" type="number" step="1" hint="Smaller numbers come first" {...register('sortOrder')} />
      <div className="sm:col-span-2">
        <label htmlFor="b-image" className="block font-medium text-maroon-800">Image {banner && '(leave empty to keep the current one)'}</label>
        <input id="b-image" type="file" accept="image/jpeg,image/png,image/webp" onChange={pick} className="mt-1" aria-describedby="b-image-hint" />
        <p id="b-image-hint" className="mt-1 text-sm text-ink/60">Wide pictures work best (about 1200 × 500). JPG, PNG or WebP, up to 5 MB.{file && ` Selected: ${file.name}`}</p>
        {fileError && <p role="alert" className="mt-1 text-sm text-maroon-700">{fileError}</p>}
      </div>
      <CheckField id="b-active" label="Show on the home page" {...register('isActive')} />
      <div className="flex gap-3 sm:col-span-2">
        <button disabled={isSubmitting} className={primaryBtn}>{isSubmitting ? 'Saving...' : 'Save banner'}</button>
        <button type="button" onClick={onCancel} className={outlineBtn}>Cancel</button>
      </div>
    </form>
  );
}

export default function ManageBanners() {
  const { data, loading, error, reload } = useFetch(listBanners);
  const [editing, setEditing] = useState(null);

  const flip = async (b) => {
    try { await updateBanner(b._id, { title: b.title, subtitle: b.subtitle || '', link: b.link || '', sortOrder: b.sortOrder, isActive: !b.isActive }); reload(); } catch (err) { toast.error(err.message); }
  };
  const remove = async (b) => {
    if (!window.confirm(`Delete the banner "${b.title}"?`)) return;
    try { await deleteBanner(b._id); toast.success('Banner deleted'); reload(); } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <PageHeader title="Home page banners">{!editing && <button onClick={() => setEditing('new')} className={primaryBtn}>Add banner</button>}</PageHeader>
      {editing && <BannerForm key={editing === 'new' ? 'new' : editing._id} banner={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); reload(); }} />}
      {error && <p role="alert" className="mb-3 text-maroon-700">{error}</p>}
      {loading && !data && <p>Loading...</p>}
      {data?.length === 0 && <p className="text-ink/70">No banners yet. Active banners appear on the home page, below the main heading.</p>}
      <ul className="grid gap-4 md:grid-cols-2">
        {data?.map((b) => (
          <li key={b._id} className="overflow-hidden rounded-lg border border-gold-300 bg-white">
            <img src={b.image.url} alt={b.title} className="h-40 w-full object-cover" loading="lazy" />
            <div className="p-4">
              <p className="font-semibold text-maroon-800">{b.title} {!b.isActive && <span className="ml-1 rounded bg-cream-200 px-2 py-0.5 text-xs font-normal">Hidden</span>}</p>
              {b.subtitle && <p className="text-sm text-ink/70">{b.subtitle}</p>}
              {b.link && <p className="text-sm text-ink/60">Opens {b.link}</p>}
              <div className="mt-3 flex gap-4"><button onClick={() => setEditing(b)} className={linkBtn}>Edit</button><button onClick={() => flip(b)} className={linkBtn}>{b.isActive ? 'Hide' : 'Show'}</button><button onClick={() => remove(b)} className={linkBtn}>Delete</button></div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
