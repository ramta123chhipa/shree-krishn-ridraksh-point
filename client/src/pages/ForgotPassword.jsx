import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthLayout from '../components/common/AuthLayout';
import FormField, { emailRules } from '../components/common/FormField';
import { forgotPassword } from '../services/authService';

export default function ForgotPassword() {
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    setServerError('');
    try {
      const res = await forgotPassword(email);
      setMessage(res.message);
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthLayout title="Forgot password" subtitle="Enter your email and we will send a reset link.">
      {message ? (
        <p role="status" className="rounded-md bg-saffron-50 p-4">{message}</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          {serverError && <p role="alert" className="rounded-md bg-maroon-50 p-3 text-maroon-700">{serverError}</p>}
          <FormField id="fp-email" label="Email" type="email" autoComplete="email" error={errors.email} {...register('email', emailRules)} />
          <button disabled={isSubmitting} className="w-full rounded-md bg-maroon-700 py-3 font-medium text-cream-50 hover:bg-maroon-800 disabled:opacity-60">
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      )}
      <p className="mt-4 text-center"><Link to="/login" className="text-saffron-600 hover:underline">Back to log in</Link></p>
    </AuthLayout>
  );
}
