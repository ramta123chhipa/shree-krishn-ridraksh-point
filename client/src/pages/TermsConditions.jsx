import PageLayout, { DraftNote } from '../components/common/PageLayout';

export default function TermsConditions() {
  return (
    <PageLayout title="Terms & Conditions" description="Terms of using Shree Krishna Rudraksh Point.">
      <DraftNote />
      <h2>Using the site</h2>
      <p>By placing an order you agree to give accurate information and to pay for the items you order.</p>
      <h2>Products</h2>
      <p>We try to describe products accurately. Natural items vary slightly in colour, size and markings.</p>
      <h2>Prices and availability</h2>
      <p>Prices and stock can change. An order is confirmed only after payment or acceptance.</p>
    </PageLayout>
  );
}
