import Button from '../common/Button';

// Links go to live filters, so the banners never promise something that is not in the catalogue.
// Admin-managed banners arrive in Phase 5.
export default function OffersSection() {
  return (
    <section className="container-page py-12">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-lg bg-maroon-800 p-8 text-cream-100">
          <h2 className="text-3xl font-semibold text-gold-300">Products on offer</h2>
          <p className="mt-2 max-w-sm">See everything currently available at a discounted price.</p>
          <Button to="/shop?onSale=true" variant="saffron" className="mt-6">View offers</Button>
        </div>
        <div className="rounded-lg border border-gold-400 bg-saffron-50 p-8">
          <h2 className="text-3xl font-semibold">Japa malas</h2>
          <p className="mt-2 max-w-sm text-ink/80">108+1 bead malas for daily chanting.</p>
          <Button to="/category/rudraksh-mala" className="mt-6">Shop malas</Button>
        </div>
      </div>
    </section>
  );
}
