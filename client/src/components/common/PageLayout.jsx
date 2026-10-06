import Seo from './Seo';

// Simple readable wrapper for About / policy / FAQ pages.
export default function PageLayout({ title, description, children }) {
  return (
    <article className="container-page max-w-3xl py-12">
      <Seo title={title} description={description} />
      <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
      <div className="mt-6 space-y-4 leading-relaxed text-ink/85 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    </article>
  );
}

export const DraftNote = () => (
  <p className="rounded-md border border-gold-400 bg-saffron-50 p-3 text-sm">
    Draft text. Review and adapt this page to your business (and with a legal adviser where needed) before launch.
  </p>
);
