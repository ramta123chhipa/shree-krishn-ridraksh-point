import { useForm } from 'react-hook-form';
import FormField from '../common/FormField';

// Used on the profile page now and in checkout (Phase 4).
export default function AddressForm({ defaultValues, onSubmit, onCancel, submitLabel = 'Save address' }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { label: 'Home', isDefault: false, ...defaultValues },
  });
  const req = (name) => ({ required: `${name} is required` });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-4 sm:grid-cols-2">
      <FormField id="ad-name" label="Full name" autoComplete="name" error={errors.fullName} {...register('fullName', req('Full name'))} />
      <FormField id="ad-phone" label="Phone" type="tel" autoComplete="tel" error={errors.phone}
        {...register('phone', { ...req('Phone'), pattern: { value: /^[0-9+\-\s]{7,15}$/, message: 'Enter a valid phone number' } })} />
      <FormField id="ad-line1" label="Address line 1" className="sm:col-span-2" autoComplete="address-line1" error={errors.line1} {...register('line1', req('Address'))} />
      <FormField id="ad-line2" label="Address line 2 (optional)" className="sm:col-span-2" autoComplete="address-line2" {...register('line2')} />
      <FormField id="ad-city" label="City" autoComplete="address-level2" error={errors.city} {...register('city', req('City'))} />
      <FormField id="ad-state" label="State" autoComplete="address-level1" error={errors.state} {...register('state', req('State'))} />
      <FormField id="ad-pin" label="Pincode" inputMode="numeric" autoComplete="postal-code" error={errors.pincode}
        {...register('pincode', { ...req('Pincode'), pattern: { value: /^[1-9][0-9]{5}$/, message: 'Enter a valid 6-digit pincode' } })} />
      <div>
        <label htmlFor="ad-label" className="block font-medium text-maroon-800">Address type</label>
        <select id="ad-label" {...register('label')} className="mt-1 w-full rounded-md border border-gold-400 bg-white px-4 py-2.5">
          <option>Home</option><option>Work</option><option>Other</option>
        </select>
      </div>
      <label className="flex items-center gap-2 sm:col-span-2">
        <input type="checkbox" {...register('isDefault')} className="accent-maroon-700" /> Make this my default address
      </label>
      <div className="flex gap-3 sm:col-span-2">
        <button disabled={isSubmitting} className="rounded-md bg-maroon-700 px-6 py-2.5 font-medium text-cream-50 hover:bg-maroon-800 disabled:opacity-60">
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && <button type="button" onClick={onCancel} className="rounded-md border border-maroon-700 px-6 py-2.5 text-maroon-700 hover:bg-maroon-50">Cancel</button>}
      </div>
    </form>
  );
}
