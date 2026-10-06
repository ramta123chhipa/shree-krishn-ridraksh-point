import PageLayout, { DraftNote } from '../components/common/PageLayout';

export default function ShippingPolicy() {
  return (
    <PageLayout title="Shipping Policy" description="How and when we ship your order.">
      <DraftNote />
      <h2>Dispatch</h2>
      <p>Orders are dispatched within 1-3 working days after confirmation.</p>
      <h2>Delivery</h2>
      <p>Delivery time depends on your location and the courier. A tracking update is shared once the order ships.</p>
      <h2>Shipping charges</h2>
      <p>Charges, if any, are shown at checkout before you pay.</p>
    </PageLayout>
  );
}
