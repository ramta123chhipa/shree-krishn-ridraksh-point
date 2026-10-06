import PageLayout from '../components/common/PageLayout';
import { FaqList } from '../components/home/FaqSection';

export default function FAQ() {
  return (
    <PageLayout title="Frequently Asked Questions" description="Answers about orders, delivery, returns and authenticity.">
      <FaqList />
    </PageLayout>
  );
}
