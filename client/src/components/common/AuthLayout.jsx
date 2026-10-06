import Seo from './Seo';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="container-page flex justify-center py-12">
      <Seo title={title} />
      <div className="w-full max-w-md rounded-lg border border-gold-300 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <p className="mt-2 text-ink/70">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
