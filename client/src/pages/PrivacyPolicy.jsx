import PageLayout, { DraftNote } from '../components/common/PageLayout';

export default function PrivacyPolicy() {
  return (
    <PageLayout title="Privacy Policy" description="How we handle your personal information.">
      <DraftNote />
      <h2>What we collect</h2>
      <p>Details you give us: name, email, phone, delivery address and messages. We also collect order and payment status (never card numbers).</p>
      <h2>How we use it</h2>
      <p>To process orders, provide support, and send updates you have asked for.</p>
      <h2>Your choices</h2>
      <p>You can ask us to correct or delete your information through the contact page.</p>
    </PageLayout>
  );
}
