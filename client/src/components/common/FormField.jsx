import { forwardRef } from 'react';

// Label + input + error message, for use with react-hook-form's `register`.
// forwardRef is required: `register` hands back a ref that must reach the <input>,
// otherwise the form cannot read what the user typed.
const FormField = forwardRef(function FormField({ id, label, error, hint, className = '', ...inputProps }, ref) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-medium text-maroon-800">{label}</label>
      <input
        ref={ref}
        id={id}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1 w-full rounded-md border border-gold-400 bg-white px-4 py-2.5 outline-none focus:border-saffron-500"
        {...inputProps}
      />
      {hint && !error && <p className="mt-1 text-sm text-ink/60">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-maroon-700">{error.message}</p>}
    </div>
  );
});

export default FormField;

export const passwordRules = {
  required: 'Password is required',
  minLength: { value: 8, message: 'At least 8 characters' },
  maxLength: { value: 72, message: 'At most 72 characters' },
  validate: (v) => (/[A-Za-z]/.test(v) && /[0-9]/.test(v)) || 'Must contain a letter and a number',
};

export const emailRules = {
  required: 'Email is required',
  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
};

const fieldClass = 'mt-1 w-full rounded-md border border-gold-400 bg-white px-4 py-2.5 outline-none focus:border-saffron-500';

export const TextAreaField = forwardRef(function TextAreaField({ id, label, error, hint, className = '', rows = 4, ...props }, ref) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-medium text-maroon-800">{label}</label>
      <textarea ref={ref} id={id} rows={rows} aria-invalid={error ? 'true' : 'false'} className={fieldClass} {...props} />
      {hint && !error && <p className="mt-1 text-sm text-ink/60">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-sm text-maroon-700">{error.message}</p>}
    </div>
  );
});

export const SelectField = forwardRef(function SelectField({ id, label, error, hint, className = '', children, ...props }, ref) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block font-medium text-maroon-800">{label}</label>
      <select ref={ref} id={id} aria-invalid={error ? 'true' : 'false'} className={fieldClass} {...props}>{children}</select>
      {hint && !error && <p className="mt-1 text-sm text-ink/60">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-sm text-maroon-700">{error.message}</p>}
    </div>
  );
});

export const CheckField = forwardRef(function CheckField({ id, label, hint, className = '', ...props }, ref) {
  return (
    <label htmlFor={id} className={`flex items-start gap-2 ${className}`}>
      <input ref={ref} id={id} type="checkbox" className="mt-1 h-4 w-4 accent-maroon-700" {...props} />
      <span>{label}{hint && <span className="block text-sm text-ink/60">{hint}</span>}</span>
    </label>
  );
});
