import PageHeader from '../../components/dashboard/PageHeader';
import MessagingView from '../../components/messaging/MessagingView';
import { useDocumentTitle } from '../../hooks';

export default function Messages() {
  useDocumentTitle('Messages');

  return (
    <div className="animate-fade-up">
      <PageHeader
        title="Messages"
        subtitle="Every conversation with tenants: visits, offers and questions about your listings."
      />
      <MessagingView role="owner" />
    </div>
  );
}
