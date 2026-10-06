import Seo from '../common/Seo';

export default function PageHeader({ title, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <Seo title={`${title} (Admin)`} />
      <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export const primaryBtn = 'inline-flex items-center justify-center rounded-md bg-maroon-700 px-5 py-2.5 font-medium text-cream-50 hover:bg-maroon-800 disabled:opacity-60';
export const outlineBtn = 'inline-flex items-center justify-center rounded-md border border-maroon-700 px-5 py-2.5 font-medium text-maroon-700 hover:bg-maroon-50 disabled:opacity-60';
export const linkBtn = 'text-maroon-700 underline hover:text-saffron-600 disabled:opacity-50';
