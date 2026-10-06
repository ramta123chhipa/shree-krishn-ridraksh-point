import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { subscribeNewsletter } from '../../services/contactService';

export default function Newsletter() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    try {
      const res = await subscribeNewsletter(email);
      toast.success(res.message || 'Subscribed');
      reset();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section className="bg-maroon-800 py-12 text-cream-100">
      <div className="container-page max-w-2xl text-center">
        <h2 className="text-3xl font-semibold text-gold-300">Stay in touch</h2>
        <p className="mt-2">New arrivals and offers, by email. No spam.</p>
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 text-left">
            <label htmlFor="nl-email" className="sr-only">Email address</label>
            <input id="nl-email" type="email" placeholder="you@example.com"
              {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })}
              className="w-full rounded-md px-4 py-3 text-ink outline-none" />
            {errors.email && <p role="alert" className="mt-1 text-sm text-saffron-400">{errors.email.message}</p>}
          </div>
          <button disabled={isSubmitting} className="rounded-md bg-saffron-500 px-6 py-3 font-medium text-white hover:bg-saffron-600 disabled:opacity-60">
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </section>
  );
}
