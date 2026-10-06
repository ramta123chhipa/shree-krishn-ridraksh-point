import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import AuthLayout from '../components/common/AuthLayout';
import FormField, { emailRules } from '../components/common/FormField';
import { useAuth } from '../hooks/useAuth';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  // Go back to the page the visitor came from (set by ProtectedRoute / useRequireLogin)
  const from = location.state?.from;
  const target = from ? `${from.pathname}${from.search || ''}` : '/';

  const onSubmit = async (values) => {
    setServerError('');
    try {
      await login(values);
      navigate(target, { replace: true });
    } catch (err) {
      setServerError(err.message);
    }
  };

  return (
    <AuthLayout title="Log in" subtitle="Welcome back.">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError && <p role="alert" className="rounded-md bg-maroon-50 p-3 text-maroon-700">{serverError}</p>}
        <FormField id="login-email" label="Email" type="email" autoComplete="email" error={errors.email} {...register('email', emailRules)} />
        <FormField id="login-password" label="Password" type="password" autoComplete="current-password" error={errors.password}
          {...register('password', { required: 'Password is required' })} />
        <button disabled={isSubmitting} className="w-full rounded-md bg-maroon-700 py-3 font-medium text-cream-50 hover:bg-maroon-800 disabled:opacity-60">
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="mt-4 text-center"><Link to="/forgot-password" className="text-saffron-600 hover:underline">Forgot your password?</Link></p>
      <p className="mt-2 text-center">New here? <Link to="/register" state={location.state} className="text-saffron-600 hover:underline">Create an account</Link></p>
    </AuthLayout>
  );
}
