import { useFieldArray, useForm } from 'react-hook-form';
import FormField, { CheckField, SelectField, TextAreaField } from '../common/FormField';
import { outlineBtn, primaryBtn } from './PageHeader';

// Turns the form's text values into what the API expects.
export const buildPayload = (v) => ({
  name: v.name.trim(),
  sku: v.sku.trim(),
  category: v.category,
  description: v.description.trim(),
  price: Number(v.price),
  discountPrice: v.discountPrice === '' || v.discountPrice == null ? null : Number(v.discountPrice), // empty = no discount
  stock: v.stock === '' || v.stock == null ? 0 : Number(v.stock),
  weight: v.weight === '' || v.weight == null ? null : Number(v.weight),
  isFeatured: !!v.isFeatured,
  isBestSeller: !!v.isBestSeller,
  isActive: !!v.isActive,
  authenticity: { verified: !!v.authVerified, details: (v.authDetails || '').trim() },
  variants: (v.variants || []).map((o) => ({
    ...(o._id ? { _id: o._id } : {}), // keep ids so carts pointing at an option stay valid
    label: o.label.trim(),
    price: o.price === '' || o.price == null ? '' : Number(o.price),
    stock: o.stock === '' || o.stock == null ? 0 : Number(o.stock),
  })),
  specifications: (v.specifications || []).map((s) => ({ key: s.key.trim(), value: s.value.trim() })).filter((s) => s.key && s.value),
});

export const toFormValues = (p) => ({
  name: p?.name || '', sku: p?.sku || '', category: p?.category?._id || p?.category || '', description: p?.description || '',
  price: p?.price ?? '', discountPrice: p?.discountPrice ?? '', stock: p?.stock ?? 0, weight: p?.weight ?? '',
  isFeatured: !!p?.isFeatured, isBestSeller: !!p?.isBestSeller, isActive: p ? p.isActive !== false : true,
  authVerified: !!p?.authenticity?.verified, authDetails: p?.authenticity?.details || '',
  variants: (p?.variants || []).map((o) => ({ _id: o._id, label: o.label, price: o.price ?? '', stock: o.stock ?? 0 })),
  specifications: (p?.specifications || []).map((s) => ({ key: s.key, value: s.value })),
});

// Categories first, each followed by its sub-categories.
const orderedCategories = (list) => {
  const tops = list.filter((c) => !c.parent);
  return tops.flatMap((t) => [{ ...t, label: t.name }, ...list.filter((c) => c.parent === t._id).map((c) => ({ ...c, label: `${t.name} › ${c.name}` }))]);
};

const Section = ({ title, children }) => (
  <fieldset className="rounded-lg border border-gold-300 bg-white p-5">
    <legend className="px-2 text-xl font-semibold text-maroon-800">{title}</legend>
    {children}
  </fieldset>
);

export default function ProductForm({ initial, categories, onSubmit, onCancel, submitLabel = 'Save product', extra }) {
  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: toFormValues(initial) });
  const variants = useFieldArray({ control, name: 'variants' });
  const specs = useFieldArray({ control, name: 'specifications' });
  const hasVariants = variants.fields.length > 0;
  const price = Number(watch('price'));
  const req = (label) => ({ required: `${label} is required` });

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(buildPayload(v)))} noValidate className="space-y-6">
      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="p-name" label="Product name" className="sm:col-span-2" error={errors.name} {...register('name', { ...req('Name'), minLength: { value: 2, message: 'At least 2 characters' } })} />
          <FormField id="p-sku" label="SKU (unique code)" error={errors.sku} hint="For example RUD-PM-002" {...register('sku', { ...req('SKU'), minLength: { value: 2, message: 'At least 2 characters' } })} />
          <SelectField id="p-cat" label="Category" error={errors.category} {...register('category', req('Category'))}>
            <option value="">Choose a category</option>
            {orderedCategories(categories).map((c) => <option key={c._id} value={c._id}>{c.label}</option>)}
          </SelectField>
          <TextAreaField id="p-desc" label="Description" className="sm:col-span-2" rows={5} error={errors.description}
            {...register('description', { ...req('Description'), minLength: { value: 10, message: 'Please write at least 10 characters' } })} />
        </div>
      </Section>

      <Section title="Price and stock">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <FormField id="p-price" label="Price (Rs.)" type="number" step="0.01" min="1" error={errors.price} {...register('price', { ...req('Price'), min: { value: 1, message: 'Must be at least 1' } })} />
          <FormField id="p-disc" label="Discount price (Rs.)" type="number" step="0.01" min="1" error={errors.discountPrice} hint="Leave empty for no discount"
            {...register('discountPrice', { validate: (v) => v === '' || v == null || Number(v) < price || 'Must be lower than the price' })} />
          <FormField id="p-stock" label="Stock" type="number" step="1" min="0" disabled={hasVariants} error={errors.stock}
            hint={hasVariants ? 'Stock is counted per option below' : undefined}
            {...register('stock', { min: { value: 0, message: 'Cannot be negative' }, validate: (v) => v === '' || Number.isInteger(Number(v)) || 'Whole numbers only' })} />
          <FormField id="p-weight" label="Weight (grams)" type="number" step="0.01" min="0" error={errors.weight} {...register('weight')} />
        </div>
      </Section>

      <Section title="Options (optional)">
        <p className="mb-3 text-sm text-ink/70">Use options when a product comes in sizes or types (for example 5 mm, 7 mm). Each option has its own stock, and its own price if you set one.</p>
        {variants.fields.map((f, i) => (
          <div key={f.id} className="mb-3 grid items-end gap-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
            <FormField id={`v-label-${i}`} label="Option name" error={errors.variants?.[i]?.label} {...register(`variants.${i}.label`, req('Option name'))} />
            <FormField id={`v-price-${i}`} label="Price (optional)" type="number" step="0.01" min="0" {...register(`variants.${i}.price`)} />
            <FormField id={`v-stock-${i}`} label="Stock" type="number" step="1" min="0" {...register(`variants.${i}.stock`)} />
            <button type="button" onClick={() => variants.remove(i)} className="pb-3 text-maroon-700 underline" aria-label={`Remove option ${i + 1}`}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => variants.append({ label: '', price: '', stock: 0 })} className={outlineBtn}>Add an option</button>
      </Section>

      <Section title="Specifications (optional)">
        {specs.fields.map((f, i) => (
          <div key={f.id} className="mb-3 grid items-end gap-3 sm:grid-cols-[1fr_2fr_auto]">
            <FormField id={`s-key-${i}`} label="Name" placeholder="e.g. Origin" {...register(`specifications.${i}.key`)} />
            <FormField id={`s-val-${i}`} label="Value" placeholder="e.g. Nepal" {...register(`specifications.${i}.value`)} />
            <button type="button" onClick={() => specs.remove(i)} className="pb-3 text-maroon-700 underline" aria-label={`Remove specification ${i + 1}`}>Remove</button>
          </div>
        ))}
        <button type="button" onClick={() => specs.append({ key: '', value: '' })} className={outlineBtn}>Add a specification</button>
      </Section>

      <Section title="Authenticity">
        <CheckField id="p-auth" label="This product has been verified as authentic" hint="Shown to customers on the product page. Tick it only for products you have verified." {...register('authVerified')} />
        <TextAreaField id="p-authd" label="Verification details (optional)" rows={2} className="mt-3" hint="For example: lab certificate number, or how it was verified" {...register('authDetails')} />
      </Section>

      <Section title="Visibility">
        <div className="space-y-2">
          <CheckField id="p-feat" label="Featured (shown on the home page)" {...register('isFeatured')} />
          <CheckField id="p-best" label="Best seller" {...register('isBestSeller')} />
          <CheckField id="p-active" label="Visible in the shop" hint="Untick to hide the product without deleting it" {...register('isActive')} />
        </div>
      </Section>

      {extra}

      <div className="flex gap-3">
        <button disabled={isSubmitting} className={primaryBtn}>{isSubmitting ? 'Saving...' : submitLabel}</button>
        {onCancel && <button type="button" onClick={onCancel} className={outlineBtn}>Cancel</button>}
      </div>
    </form>
  );
}
