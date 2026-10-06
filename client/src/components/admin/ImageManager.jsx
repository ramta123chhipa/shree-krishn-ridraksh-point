import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { deleteProductImage, makePrimaryImage, uploadProductImages } from '../../services/adminService';
import { outlineBtn } from './PageHeader';

export const MAX_IMAGES = 8;
const MAX_MB = 5;
const TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Checks files in the browser first, so the owner gets a clear message before anything is uploaded.
export const checkFiles = (files, alreadyHave = 0) => {
  if (alreadyHave + files.length > MAX_IMAGES) return `A product can have up to ${MAX_IMAGES} photos`;
  const bad = files.find((f) => !TYPES.includes(f.type));
  if (bad) return `"${bad.name}" is not a JPG, PNG or WebP image`;
  const big = files.find((f) => f.size > MAX_MB * 1024 * 1024);
  if (big) return `"${big.name}" is larger than ${MAX_MB} MB`;
  return '';
};

const Thumb = ({ src, alt, main, children }) => (
  <li className="w-36">
    <div className="relative aspect-square overflow-hidden rounded-md border border-gold-300 bg-cream-100">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      {main && <span className="absolute left-1 top-1 rounded bg-maroon-700 px-2 py-0.5 text-xs text-cream-50">Main photo</span>}
    </div>
    <div className="mt-1 flex flex-wrap gap-x-3 text-sm">{children}</div>
  </li>
);

const FileButton = ({ id, label, onFiles, disabled }) => {
  const ref = useRef(null);
  return (
    <>
      <input ref={ref} id={id} type="file" multiple accept={TYPES.join(',')} className="sr-only"
        onChange={(e) => { onFiles([...e.target.files]); e.target.value = ''; }} />
      <button type="button" disabled={disabled} onClick={() => ref.current.click()} className={outlineBtn}>{label}</button>
    </>
  );
};

// ----- Add product: pick photos now, they are uploaded right after the product is saved -----
export function NewImagePicker({ files, onChange }) {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);

  const add = (picked) => {
    const problem = checkFiles(picked, files.length);
    if (problem) { toast.error(problem); return; }
    onChange([...files, ...picked]);
  };

  return (
    <fieldset className="rounded-lg border border-gold-300 bg-white p-5">
      <legend className="px-2 text-xl font-semibold text-maroon-800">Photos</legend>
      <p className="mb-3 text-sm text-ink/70">The first photo is the main one. JPG, PNG or WebP, up to {MAX_MB} MB each, up to {MAX_IMAGES} photos.</p>
      <ul className="mb-3 flex flex-wrap gap-4">
        {files.map((f, i) => (
          <Thumb key={`${f.name}-${i}`} src={urls[i]} alt={f.name} main={i === 0}>
            <button type="button" className="text-maroon-700 underline" onClick={() => onChange(files.filter((_, j) => j !== i))}>Remove</button>
          </Thumb>
        ))}
      </ul>
      <FileButton id="new-images" label={files.length ? 'Add more photos' : 'Choose photos'} onFiles={add} disabled={files.length >= MAX_IMAGES} />
    </fieldset>
  );
}

// ----- Edit product: every change happens straight away -----
export function ProductImages({ product, onChange }) {
  const [busy, setBusy] = useState(false);

  const run = async (fn, ok) => {
    setBusy(true);
    try { onChange(await fn()); if (ok) toast.success(ok); } catch (err) { toast.error(err.message); } finally { setBusy(false); }
  };

  const add = (picked) => {
    const problem = checkFiles(picked, product.images.length);
    if (problem) { toast.error(problem); return; }
    run(() => uploadProductImages(product._id, picked), 'Photos uploaded');
  };

  return (
    <section className="rounded-lg border border-gold-300 bg-white p-5" aria-labelledby="photos-h">
      <h2 id="photos-h" className="mb-2 text-xl font-semibold text-maroon-800">Photos</h2>
      <p className="mb-3 text-sm text-ink/70">Changes here are saved immediately. The main photo is shown first in the shop.</p>
      {product.images.length === 0 && <p className="mb-3 text-ink/70">No photos yet. The shop shows a drawing until you add one.</p>}
      <ul className="mb-3 flex flex-wrap gap-4">
        {product.images.map((img, i) => (
          <Thumb key={img._id} src={img.url} alt={`${product.name}, photo ${i + 1}`} main={i === 0}>
            {i !== 0 && <button type="button" disabled={busy} className="text-maroon-700 underline" onClick={() => run(() => makePrimaryImage(product._id, img._id), 'Main photo changed')}>Make main</button>}
            <button type="button" disabled={busy} className="text-maroon-700 underline"
              onClick={() => window.confirm('Remove this photo?') && run(() => deleteProductImage(product._id, img._id), 'Photo removed')}>Remove</button>
          </Thumb>
        ))}
      </ul>
      <FileButton id="more-images" label={busy ? 'Working...' : 'Add photos'} onFiles={add} disabled={busy || product.images.length >= MAX_IMAGES} />
    </section>
  );
}
