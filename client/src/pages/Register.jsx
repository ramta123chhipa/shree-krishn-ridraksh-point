import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AuthLayout from '../components/common/AuthLayout';
import FormField, { emailRules, passwordRules } from '../components/common/FormField';
import { useAuth } from '../hooks/useAuth';

export default function Register() {
  const { register: signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const from = location.state?.from;
  const target = from ? `${from.pathname}${from.search || ''}` : '/';

  const onSubmit = async ({ confirmPassword, ...values }) => {
    setServerError('');
    try {
      const res = await signUp(values);
      toast.success(res.message, { duration: 6000 });
      navigate(target, { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthLayout title="Create account" subtitle="Save your addresses, wishlist and cart.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <p role="alert" className="rounded-md bg-maroon-50 p-3 text-maroon-700">{serverError}</p>}
        <FormField id="reg-name" label="Full name" autoComplete="name" error={errors.name}
          {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'At least 2 characters' } })} />
        <FormField id="reg-email" label="Email" type="email" autoComplete="email" error={errors.email} {...register('email', emailRules)} />
        <FormField id="reg-phone" label="Phone (optional)" type="tel" autoComplete="tel" error={errors.phone}
          {...register('phone', { pattern: { value: /^[0-9+\-\s]{7,15}$/, message: 'Enter a valid phone number' } })} />
        <FormField id="reg-password" label="Password" type="password" autoComplete="new-password" error={errors.password}
          hint="At least 8 characters, with a letter and a number" {...register('password', passwordRules)} />
        <FormField id="reg-confirm" label="Confirm password" type="password" autoComplete="new-password" error={errors.confirmPassword}
          {...register('confirmPassword', { required: 'Please confirm your password', validate: (v) => v === watch('password') || 'Passwords do not match' })} />
        <button disabled={isSubmitting} className="w-full rounded-md bg-maroon-700 py-3 font-medium text-cream-50 hover:bg-maroon-800 disabled:opacity-60">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="mt-4 text-center">Already registered? <Link to="/login" state={location.state} className="text-saffron-600 hover:underline">Log in</Link></p>
    </AuthLayout>
  );
}
