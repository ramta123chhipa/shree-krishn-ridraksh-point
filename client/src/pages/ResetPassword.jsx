import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import AuthLayout from '../components/common/AuthLayout';
import FormField, { passwordRules } from '../components/common/FormField';
import { resetPassword } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

export default function ResetPassword() {
  const { token } = useParams();
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ password }) => {
    setServerError('');
    try {
      const res = await resetPassword(token, password);
      setUser(res.data); // the server also logs them in
      toast.success('Password updated');
      navigate('/', { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthLayout title="Choose a new password">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && (
          <p role="alert" className="rounded-md bg-maroon-50 p-3 text-maroon-700">
            {serverError}. <Link to="/forgot-password" className="underline">Request a new link</Link>
          </p>
        )}
        <FormField id="rp-password" label="New password" type="password" autoComplete="new-password" error={errors.password}
          hint="At least 8 characters, with a letter and a number" {...register('password', passwordRules)} />
        <FormField id="rp-confirm" label="Confirm new password" type="password" autoComplete="new-password" error={errors.confirm}
          {...register('confirm', { required: 'Please confirm your password', validate: (v) => v === watch('password') || 'Passwords do not match' })} />
        <button disabled={isSubmitting} className="w-full rounded-md bg-maroon-700 py-3 font-medium text-cream-50 hover:bg-maroon-800 disabled:opacity-60">
          {isSubmitting ? 'Saving...' : 'Update password'}
        </button>
      </form>
    </AuthLayout>
  );
}
