import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '../common/Avatar';
import Icon from '../common/icons';
import ImageWithFallback from '../common/ImageWithFallback';
import { VerificationBadge } from '../common/Badge';
import { formatTime, cn } from '../../utils/format';

export default function ChatWindow({ conversation, currentUserId, onSend, onBack, sending = false }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    setText('');
    setError('');
  }, [conversation?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [conversation?.messages?.length, conversation?.id]);

  async function submit(e) {
    e.preventDefault();
    const body = text.trim();
    if (!body) {
      setError('Write a message first.');
      return;
    }
    setError('');
    setText('');
    const result = await onSend?.(body);
    if (result === false) setText(body); // restore the draft if sending failed
  }

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
          <Icon name="chat" className="h-7 w-7" />
        </div>
        <p className="text-sm font-semibold text-slate-800">Select a conversation</p>
        <p className="mt-1.5 max-w-xs text-sm leading-relaxed text-slate-500">
          Choose a conversation on the left to continue a discussion with an owner or tenant.
        </p>
      </div>
    );
  }

  const property = conversation.property;
  const other = conversation.other;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-line px-4 py-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to conversations"
            className="-ml-1 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 lg:hidden"
          >
            <Icon name="arrowLeft" className="h-5 w-5" />
          </button>
        )}
        <Avatar name={other?.name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-slate-900">{other?.name}</p>
            {other?.verification === 'verified' && <VerificationBadge status="verified" className="hidden sm:inline-flex" />}
          </div>
          <p className="truncate text-xs text-slate-400 capitalize">{other?.role === 'owner' ? 'Owner / Agent' : 'Tenant'}</p>
        </div>
        {property && (
          <Link
            to={`/property/${property.id}`}
            className="hidden items-center gap-2 rounded-lg border border-line bg-white px-2.5 py-1.5 transition hover:border-brand-300 sm:flex"
          >
            <span className="h-8 w-10 shrink-0 overflow-hidden rounded">
              <ImageWithFallback src={property.image} alt="" />
            </span>
            <span className="max-w-44 truncate text-xs font-medium text-slate-600">{property.title}</span>
          </Link>
        )}
      </header>

      {/* Property context strip */}
      {property && (
        <div className="flex items-center gap-2 border-b border-line bg-slate-50 px-4 py-2 text-xs text-slate-500">
          <Icon name="building" className="h-4 w-4 text-slate-400" />
          <span className="truncate">
            Conversation about <span className="font-medium text-slate-700">{property.title}</span> · {property.location}
          </span>
        </div>
      )}

      {/* Messages */}
      <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto bg-slate-50/60 px-4 py-5 thin-scrollbar">
        {conversation.messages.length === 0 && (
          <p className="py-8 text-center text-sm text-slate-400">No messages yet. Say hello to start the conversation.</p>
        )}
        {conversation.messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={cn('flex gap-2.5', mine ? 'justify-end' : 'justify-start')}>
              {!mine && <Avatar name={other?.name} size="xs" className="mt-1" />}
              <div className={cn('max-w-[78%] sm:max-w-[65%]', mine && 'items-end')}>
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm animate-fade-up',
                    mine ? 'rounded-br-sm bg-brand-800 text-white' : 'rounded-bl-sm border border-line bg-white text-slate-700'
                  )}
                >
                  {m.text}
                </div>
                <p className={cn('mt-1 px-1 text-[11px] text-slate-400', mine && 'text-right')}>{formatTime(m.at)}</p>
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex justify-end">
            <div className="rounded-2xl rounded-br-sm bg-brand-800/70 px-4 py-3">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <form onSubmit={submit} className="border-t border-line bg-white p-3">
        {error && <p className="mb-2 text-xs font-medium text-red-600">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submit(e);
              }
            }}
            rows={1}
            placeholder="Type your message…"
            aria-label="Message"
            className="max-h-32 min-h-11 flex-1 resize-none rounded-lg border border-line bg-slate-50 px-3.5 py-3 text-sm leading-relaxed focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-900 text-white transition hover:bg-brand-800 disabled:pointer-events-none disabled:opacity-40"
          >
            <Icon name="send" className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1.5 text-[11px] text-slate-400">Enter to send · Shift + Enter for a new line</p>
      </form>
    </div>
  );
}
