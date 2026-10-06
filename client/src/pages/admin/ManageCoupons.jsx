import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import PageHeader, { linkBtn, outlineBtn, primaryBtn } from '../../components/admin/PageHeader';
import DataTable from '../../components/admin/DataTable';
import FormField, { CheckField, SelectField } from '../../components/common/FormField';
import { useFetch } from '../../hooks/useFetch';
import { createCoupon, deleteCoupon, listCoupons, updateCoupon } from '../../services/adminService';
import { formatPrice } from '../../utils/formatPrice';

const day = (d) => (d ? new Date(d).toLocaleDateString('en-CA') : ''); // YYYY-MM-DD for <input type="date">

// Date inputs give a day. A start date means the beginning of that day, an expiry date means its end.
export const couponPayload = (v) => ({
  code: v.code.trim().toUpperCase(),
  description: v.description.trim(),
  discountType: v.discountType,
  discountValue: Number(v.discountValue),
  maxDiscount: v.discountType === 'percent' && v.maxDiscount !== '' ? Number(v.maxDiscount) : undefined,
  minOrderValue: v.minOrderValue === '' ? 0 : Number(v.minOrderValue),
  startsAt: v.startsAt ? new Date(`${v.startsAt}T00:00:00`).toISOString() : null,
  expiresAt: v.expiresAt ? new Date(`${v.expiresAt}T23:59:59`).toISOString() : null,
  usageLimit: v.usageLimit === '' ? 0 : Number(v.usageLimit),
  perUserLimit: v.perUserLimit === '' ? 1 : Number(v.perUserLimit),
  isActive: !!v.isActive,
});

const statusOf = (c) => {
  const now = Date.now();
  if (!c.isActive) return 'Off';
  if (c.expiresAt && new Date(c.expiresAt) < now) return 'Expired';
  if (c.startsAt && new Date(c.startsAt) > now) return 'Scheduled';
  if (c.usageLimit > 0 && c.usedCount >= c.usageLimit) return 'Used up';
  return 'Live';
};

function CouponForm({ coupon, onDone, onCancel }) {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      code: coupon?.code || '', description: coupon?.description || '', discountType: coupon?.discountType || 'percent', discountValue: coupon?.discountValue ?? '',
      maxDiscount: coupon?.maxDiscount ?? '', minOrderValue: coupon?.minOrderValue ?? 0, startsAt: day(coupon?.startsAt), expiresAt: day(coupon?.expiresAt),
      usageLimit: coupon?.usageLimit ?? 0, perUserLimit: coupon?.perUserLimit ?? 1, isActive: coupon ? coupon.isActive : true,
    },
  });
  const type = watch('discountType');
  const used = coupon?.usedCount > 0;

  const submit = async (v) => {
    try {
      if (coupon) await updateCoupon(coupon._id, couponPayload(v)); else await createCoupon(couponPayload(v));
      toast.success('Coupon saved');
      onDone();
    } catch (err) { toast.error(err.message); }
  };

  return (
    <form onSubmit={handleSubmit(submit)} noValidate className="mb-8 grid gap-4 rounded-lg border border-gold-300 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
      <h2 className="text-xl font-semibold sm:col-span-2 lg:col-span-3">{coupon ? `Edit ${coupon.code}` : 'New coupon'}</h2>
      <FormField id="cp-code" label="Code" disabled={used} error={errors.code} hint={used ? 'Used coupons keep their code' : 'Letters, numbers, - or _ (3 to 20)'}
        {...register('code', { required: 'Code is required', pattern: { value: /^[A-Za-z0-9_-]{3,20}$/, message: '3 to 20 letters, numbers, - or _' } })} />
      <SelectField id="cp-type" label="Discount type" {...register('discountType')}>
        <option value="percent">Percent (%)</option><option value="fixed">Fixed amount (Rs.)</option>
      </SelectField>
      <FormField id="cp-value" label={type === 'percent' ? 'Percent off' : 'Rupees off'} type="number" step="0.01" min="1" error={errors.discountValue}
        {...register('discountValue', { required: 'Required', min: { value: 1, message: 'At least 1' }, validate: (v) => type !== 'percent' || Number(v) <= 100 || 'Cannot be more than 100' })} />
      {type === 'percent' && <FormField id="cp-max" label="Maximum discount (Rs., optional)" type="number" step="0.01" min="1" hint="Caps the discount on big orders" {...register('maxDiscount')} />}
      <FormField id="cp-min" label="Minimum order (Rs.)" type="number" step="0.01" min="0" {...register('minOrderValue')} />
      <FormField id="cp-start" label="Starts on (optional)" type="date" {...register('startsAt')} />
      <FormField id="cp-end" label="Expires on (optional)" type="date" error={errors.expiresAt}
        {...register('expiresAt', { validate: (v) => !v || !watch('startsAt') || v >= watch('startsAt') || 'Must not be before the start date' })} />
      <FormField id="cp-limit" label="Total uses allowed" type="number" step="1" min="0" hint="0 means unlimited" {...register('usageLimit')} />
      <FormField id="cp-per" label="Uses per customer" type="number" step="1" min="1" {...register('perUserLimit')} />
      <FormField id="cp-desc" label="Description (shown at checkout)" className="sm:col-span-2" {...register('description')} />
      <CheckField id="cp-active" label="Switched on" className="self-center" {...register('isActive')} />
      <div className="flex gap-3 sm:col-span-2 lg:col-span-3">
        <button disabled={isSubmitting} className={primaryBtn}>{isSubmitting ? 'Saving...' : 'Save coupon'}</button>
        <button type="button" onClick={onCancel} className={outlineBtn}>Cancel</button>
      </div>
    </form>
  );
}

export default function ManageCoupons() {
  const { data, loading, error, reload } = useFetch(listCoupons);
  const [editing, setEditing] = useState(null);

  const flip = async (c) => {
    try {
      await updateCoupon(c._id, { ...couponPayload({ ...c, startsAt: day(c.startsAt), expiresAt: day(c.expiresAt), maxDiscount: c.maxDiscount ?? '', description: c.description || '', isActive: !c.isActive }) });
      reload();
    } catch (err) { toast.error(err.message); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete coupon ${c.code}?`)) return;
    try { await deleteCoupon(c._id); toast.success('Coupon deleted'); reload(); } catch (err) { toast.error(err.message); }
  };

  return (
    <>
      <PageHeader title="Coupons">{!editing && <button onClick={() => setEditing('new')} className={primaryBtn}>Add coupon</button>}</PageHeader>
      {editing && <CouponForm key={editing === 'new' ? 'new' : editing._id} coupon={editing === 'new' ? null : editing} onCancel={() => setEditing(null)} onDone={() => { setEditing(null); reload(); }} />}
      {error && <p role="alert" className="mb-3 text-maroon-700">{error}</p>}
      <DataTable caption="Coupons" loading={loading} rows={data} empty="No coupons yet." columns={[
        { key: 'code', header: 'Code', render: (c) => <><strong>{c.code}</strong><br /><span className="text-sm text-ink/60">{c.description}</span></> },
        { key: 'off', header: 'Discount', render: (c) => (c.discountType === 'percent' ? `${c.discountValue}%${c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount)})` : ''}` : formatPrice(c.discountValue)) },
        { key: 'min', header: 'Min order', render: (c) => (c.minOrderValue ? formatPrice(c.minOrderValue) : 'None') },
        { key: 'when', header: 'Valid', render: (c) => (c.startsAt || c.expiresAt ? `${c.startsAt ? new Date(c.startsAt).toLocaleDateString('en-IN') : 'now'} to ${c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('en-IN') : 'no end'}` : 'Always') },
        { key: 'used', header: 'Used', render: (c) => `${c.usedCount}${c.usageLimit ? ` / ${c.usageLimit}` : ''}` },
        { key: 'status', header: 'Status', render: (c) => <span className={statusOf(c) === 'Live' ? 'font-medium text-green-700' : 'text-ink/70'}>{statusOf(c)}</span> },
        { key: 'act', header: 'Actions', render: (c) => (
          <span className="flex flex-wrap gap-3">
            <button onClick={() => setEditing(c)} className={linkBtn}>Edit</button>
            <button onClick={() => flip(c)} className={linkBtn}>{c.isActive ? 'Switch off' : 'Switch on'}</button>
            <button onClick={() => remove(c)} className={linkBtn}>Delete</button>
          </span>) },
      ]} />
    </>
  );
}
