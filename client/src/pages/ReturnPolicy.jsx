import PageLayout, { DraftNote } from '../components/common/PageLayout';

export default function ReturnPolicy() {
  return (
    <PageLayout title="Return & Refund Policy" description="Returns and refunds at Shree Krishna Rudraksh Point.">
      <DraftNote />
      <h2>Returns</h2>
      <p>Tell us within the return window (set your own number of days here) if the item arrived damaged or different from its description.</p>
      <h2>Conditions</h2>
      <ul>
        <li>The item should be unused and in its original packaging.</li>
        <li>Say clearly which items are not returnable, for example energised or custom-made pieces.</li>
      </ul>
      <h2>Refunds</h2>
      <p>Approved refunds go back to the original payment method. State how many days this takes.</p>
    </PageLayout>
  );
}
