import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConversationList from './ConversationList';
import ChatWindow from './ChatWindow';
import EmptyState from '../common/EmptyState';
import { ErrorState } from '../common/Feedback';
import messageService from '../../services/messageService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks';
import { cn } from '../../utils/format';

/**
 * Full messaging experience: conversation list + thread.
 * Used by both /tenant/messages and /owner/messages.
 */
export default function MessagingView({ role = 'tenant' }) {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const { data, loading, error, reload, setData } = useAsync(() => messageService.conversations(user?.id), [user?.id], { immediate: Boolean(user) });

  const [activeId, setActiveId] = useState(null);
  const [sending, setSending] = useState(false);
  const [mobileThread, setMobileThread] = useState(false);

  const conversations = data || [];
  const active = conversations.find((c) => c.id === activeId) || null;

  // Auto-select the first conversation on desktop.
  useEffect(() => {
    if (!activeId && conversations.length && window.innerWidth >= 1024) {
      setActiveId(conversations[0].id);
    }
  }, [conversations, activeId]);

  // Mark active conversation read when opened.
  useEffect(() => {
    if (!activeId || !user) return;
    const target = conversations.find((c) => c.id === activeId);
    if (target && target.unread > 0) {
      messageService.markRead(activeId, user.id).then(reload);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, user]);

  const select = useCallback((c) => {
    setActiveId(c.id);
    setMobileThread(true);
  }, []);

  const send = useCallback(
    async (text) => {
      if (!active || !user) return false;
      setSending(true);
      try {
        const updated = await messageService.send(active.id, text, user.id);
        setData((prev) => (prev || []).map((c) => (c.id === updated.id ? updated : c)));
        return true;
      } catch (err) {
        toast.error(err?.message || 'Message could not be sent. Please try again.');
        return false;
      } finally {
        setSending(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [active, user, setData, toast]
  );

  if (error) {
    return <ErrorState message={error} onRetry={reload} />;
  }

  if (!loading && conversations.length === 0) {
    return (
      <EmptyState
        icon="inbox"
        title="No conversations yet"
        message="When you message an owner about a property, or a tenant reaches out to you, the conversation will appear here."
        actionLabel="Browse properties"
        onAction={() => navigate('/browse')}
      />
    );
  }

  return (
    <div className="grid h-[calc(100vh-11rem)] min-h-[520px] grid-cols-1 overflow-hidden rounded-xl border border-line bg-white lg:h-[calc(100vh-10rem)] lg:grid-cols-[340px_1fr]">
      <div className={cn('min-h-0 border-r border-line', mobileThread ? 'hidden lg:flex' : 'flex flex-col')}>
        <div className="border-b border-line px-4 py-3.5">
          <h2 className="flex items-baseline gap-2 text-sm font-semibold text-slate-900">
            Messages
            <span className="text-xs font-normal text-slate-500" aria-live="polite">
              {loading ? 'Loading…' : `${conversations.length} ${conversations.length === 1 ? 'conversation' : 'conversations'}`}
            </span>
          </h2>
        </div>
        <div className="min-h-0 flex-1">
          <ConversationList conversations={conversations} activeId={activeId} onSelect={select} loading={loading} />
        </div>
      </div>

      <div className={cn('min-h-0', mobileThread ? 'flex flex-col' : 'hidden lg:flex lg:flex-col')}>
        <ChatWindow
          conversation={active}
          currentUserId={user?.id}
          onSend={send}
          sending={sending}
          onBack={() => setMobileThread(false)}
        />
      </div>
    </div>
  );
}
