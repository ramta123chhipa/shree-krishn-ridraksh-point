import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Mail, MapPin, Phone } from 'lucide-react';
import PageLayout from '../components/common/PageLayout';
import { sendContactMessage } from '../services/contactService';
import { CONTACT } from '../utils/constants';

const field = 'mt-1 w-full rounded-md border border-gold-400 bg-white px-4 py-2.5 outline-none focus:border-saffron-500';

export default function ContactUs() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await sendContactMessage(data);
      toast.success(res.message || 'Message sent');
      reset();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const Err = ({ name }) => errors[name] && <p role="alert" className="mt-1 text-sm text-maroon-700">{errors[name].message}</p>;

  return (
    <PageLayout title="Contact Us" description="Send a message to Shree Krishna Rudraksh Point.">
      <ul className="space-y-2">
        <li className="flex items-center gap-2"><Phone size={18} /> {CONTACT.phone}</li>
        <li className="flex items-center gap-2"><Mail size={18} /> {CONTACT.email}</li>
        <li className="flex items-center gap-2"><MapPin size={18} /> {CONTACT.address}</li>
      </ul>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 space-y-4">
        <div>
          <label htmlFor="c-name">Name</label>
          <input id="c-name" className={field} {...register('name', { required: 'Name is required' })} />
          <Err name="name" />
        </div>
        <div>
          <label htmlFor="c-email">Email</label>
          <input id="c-email" type="email" className={field}
            {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
          <Err name="email" />
        </div>
        <div>
          <label htmlFor="c-phone">Phone (optional)</label>
          <input id="c-phone" className={field} {...register('phone')} />
        </div>
        <div>
          <label htmlFor="c-msg">Message</label>
          <textarea id="c-msg" rows={5} className={field}
            {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Please write at least 10 characters' } })} />
          <Err name="message" />
        </div>
        <button disabled={isSubmitting} className="rounded-md bg-maroon-700 px-6 py-3 font-medium text-cream-50 hover:bg-maroon-800 disabled:opacity-60">
          {isSubmitting ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </PageLayout>
  );
}
