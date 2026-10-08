import { useMemo, useState } from 'react';
import Avatar from '../common/Avatar';
import Icon from '../common/icons';
import { cn, timeAgo } from '../../utils/format';

export default function ConversationList({ conversations = [], activeId, onSelect, loading = false }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query.trim()) return conversations;
    const q = query.toLowerCase();
    return conversations.filter((c) => [c.other?.name, c.property?.title, c.lastMessage?.text].join(' ').toLowerCase().includes(q));
  }, [conversations, query]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-line p-3.5">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations"
            aria-label="Search conversations"
            className="h-10 w-full rounded-lg border border-line bg-slate-50 pr-3 pl-10 text-sm focus:border-brand-400 focus:bg-white focus:ring-2 focus:ring-brand-100 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto thin-scrollbar">
        {loading && (
          <div className="space-y-3 p-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="skeleton h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="skeleton h-3.5 w-1/2" />
                  <div className="skeleton h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="px-5 py-12 text-center">
            <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Icon name="chat" className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-slate-700">No conversations yet</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">Message an owner from any property page to start a conversation.</p>
          </div>
        )}

        {!loading &&
          filtered.map((c) => {
            const active = c.id === activeId;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelect(c)}
                className={cn(
                  'flex w-full gap-3 border-b border-line px-4 py-3.5 text-left transition',
                  active ? 'bg-brand-50/70' : 'hover:bg-slate-50'
                )}
              >
                <div className="relative shrink-0">
                  <Avatar name={c.other?.name} size="md" />
                  {c.unread > 0 && <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-red-500" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className={cn('truncate text-sm', c.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-800')}>{c.other?.name}</p>
                    <span className="shrink-0 text-[11px] text-slate-400">{c.lastMessage ? timeAgo(c.lastMessage.at) : ''}</span>
                  </div>
                  <p className="truncate text-xs text-slate-400">{c.property?.title}</p>
                  <p className={cn('mt-0.5 truncate text-[13px]', c.unread ? 'font-medium text-slate-700' : 'text-slate-500')}>
                    {c.lastMessage ? c.lastMessage.text : 'No messages yet'}
                  </p>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}
