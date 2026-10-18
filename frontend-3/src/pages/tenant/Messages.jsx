import PageHeader from '../../components/dashboard/PageHeader';
import MessagingView from '../../components/messaging/MessagingView';
import { useDocumentTitle } from '../../hooks';

export default function Messages() {
  useDocumentTitle('Messages');

  return (
    <div>
      <PageHeader title="Messages" subtitle="Talk to owners about availability, pricing and visit logistics." />
      <MessagingView role="tenant" />
    </div>
  );
}