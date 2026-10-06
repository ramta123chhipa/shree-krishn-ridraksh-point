import { Link } from 'react-router-dom';

const styles = {
  primary: 'bg-maroon-700 text-cream-50 hover:bg-maroon-800',
  saffron: 'bg-saffron-500 text-white hover:bg-saffron-600',
  outline: 'border border-maroon-700 text-maroon-700 hover:bg-maroon-700 hover:text-cream-50',
};

// Renders a <Link> when `to` is given, otherwise a <button>.
export default function Button({ to, variant = 'primary', className = '', children, ...props }) {
  const cls = `inline-flex items-center justify-center rounded-md px-6 py-3 font-medium transition-colors ${styles[variant]} ${className}`;
  if (to) return <Link to={to} className={cls} {...props}>{children}</Link>;
  return <button className={cls} {...props}>{children}</button>;
}
