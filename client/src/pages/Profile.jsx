import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Seo from '../components/common/Seo';
import FormField, { passwordRules } from '../components/common/FormField';
import AddressForm from '../components/checkout/AddressForm';
import { useAuth } from '../hooks/useAuth';
import { resendVerification } from '../services/authService';
import * as userService from '../services/userService';

function Details() {
  const { user, setUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ defaultValues: { name: user.name, phone: user.phone || '' } });

  const onSubmit = async (values) => {
    try {
      setUser(await userService.updateProfile(values));
      toast.success('Profile updated');
    } catch (err) { toast.error(err.message); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-md space-y-4">
      <FormField id="pf-name" label="Full name" error={errors.name} {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
      <FormField id="pf-email" label="Email" value={user.email} readOnly hint="Email cannot be changed here" className="[&_input]:bg-cream-100" />
      <FormField id="pf-phone" label="Phone" type="tel" error={errors.phone} {...register('phone', { pattern: { value: /^[0-9+\-\s]{7,15}$/, message: 'Enter a valid phone number' } })} />
      <button disabled={isSubmitting} className="rounded-md bg-maroon-700 px-6 py-2.5 font-medium text-cream-50 hover:bg-maroon-800 disabled:opacity-60">Save changes</button>
    </form>
  );
}

function Addresses() {
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(null); // null | 'new' | address object

  const load = () => userService.getAddresses().then(setList).catch((e) => toast.error(e.message));
  useEffect(() => { load(); }, []);

  const save = async (values) => {
    try {
      if (editing === 'new') await userService.addAddress(values);
      else await userService.updateAddress(editing._id, values);
      toast.success('Address saved');
      setEditing(null);
      load();
    } catch (err) { toast.error(err.message); }
  };

  const remove = async (a) => {
    if (!window.confirm('Delete this address?')) return;
    try { await userService.deleteAddress(a._id); load(); } catch (err) { toast.error(err.message); }
  };

  const makeDefault = async (a) => {
    try { await userService.updateAddress(a._id, { isDefault: true }); load(); } catch (err) { toast.error(err.message); }
  };

  if (editing) {
    return <AddressForm defaultValues={editing === 'new' ? undefined : editing} onSubmit={save} onCancel={() => setEditing(null)} />;
  }
  if (!list) return <p>Loading addresses...</p>;

  return (
    <div>
      <button onClick={() => setEditing('new')} className="rounded-md bg-saffron-500 px-5 py-2.5 font-medium text-white hover:bg-saffron-600">Add new address</button>
      {list.length === 0 && <p className="mt-6 text-ink/70">You have no saved addresses yet.</p>}
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {list.map((a) => (
          <li key={a._id} className="rounded-lg border border-gold-300 bg-white p-4">
            <p className="font-semibold text-maroon-800">{a.fullName} <span className="ml-1 text-sm font-normal text-ink/60">({a.label})</span>
              {a.isDefault && <span className="ml-2 rounded bg-saffron-100 px-2 py-0.5 text-xs">Default</span>}</p>
            <p className="mt-1 text-ink/80">{a.line1}{a.line2 ? `, ${a.line2}` : ''}<br />{a.city}, {a.state} {a.pincode}<br />Phone: {a.phone}</p>
            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <button onClick={() => setEditing(a)} className="text-maroon-700 underline">Edit</button>
              <button onClick={() => remove(a)} className="text-maroon-700 underline">Delete</button>
              {!a.isDefault && <button onClick={() => makeDefault(a)} className="text-maroon-700 underline">Make default</button>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Password() {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm();
  const onSubmit = async ({ currentPassword, newPassword }) => {
    try {
      await userService.changePassword({ currentPassword, newPassword });
      toast.success('Password changed. Other devices were logged out.');
      reset();
    } catch (err) { toast.error(err.message); }
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="max-w-md space-y-4">
      <FormField id="pw-current" label="Current password" type="password" autoComplete="current-password" error={errors.currentPassword}
        {...register('currentPassword', { required: 'Current password is required' })} />
      <FormField id="pw-new" label="New password" type="password" autoComplete="new-password" error={errors.newPassword}
        hint="At least 8 characters, with a letter and a number" {...register('newPassword', passwordRules)} />
      <FormField id="pw-confirm" label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirm}
        {...register('confirm', { required: 'Please confirm your password', validate: (v) => v === watch('newPassword') || 'Passwords do not match' })} />
      <button disabled={isSubmitting} className="rounded-md bg-maroon-700 px-6 py-2.5 font-medium text-cream-50 hover:bg-maroon-800 disabled:opacity-60">Change password</button>
    </form>
  );
}

const TABS = [['details', 'My details', Details], ['addresses', 'Saved addresses', Addresses], ['password', 'Change password', Password]];

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('details');
  const Panel = TABS.find((t) => t[0] === tab)[2];

  const resend = async () => {
    try { toast.success((await resendVerification()).message); } catch (err) { toast.error(err.message); }
  };
  const signOut = async () => { await logout(); navigate('/'); };

  return (
    <div className="container-page py-10">
      <Seo title="My account" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-bold">My account</h1>
        <div className="flex gap-3">
          <Link to="/orders" className="rounded-md bg-maroon-700 px-5 py-2 text-cream-50 hover:bg-maroon-800">My orders</Link>
          <button onClick={signOut} className="rounded-md border border-maroon-700 px-5 py-2 text-maroon-700 hover:bg-maroon-50">Log out</button>
        </div>
      </div>
      <p className="mt-1 text-ink/70">Signed in as {user.name} ({user.email})</p>

      {!user.isEmailVerified && (
        <div role="status" className="mt-5 flex flex-wrap items-center gap-3 rounded-md border border-gold-400 bg-saffron-50 p-4">
          <span>Your email is not verified yet. You will need to verify it before checkout.</span>
          <button onClick={resend} className="font-medium text-maroon-700 underline">Resend verification email</button>
        </div>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-[220px_1fr]">
        <nav aria-label="Account sections">
          <ul className="flex gap-2 overflow-x-auto md:flex-col">
            {TABS.map(([key, label]) => (
              <li key={key}>
                <button onClick={() => setTab(key)} aria-current={tab === key ? 'page' : undefined}
                  className={`w-full whitespace-nowrap rounded-md px-4 py-2 text-left ${tab === key ? 'bg-maroon-700 text-cream-50' : 'hover:bg-cream-200'}`}>
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <section><Panel /></section>
      </div>
    </div>
  );
}
