import { useEffect, useRef, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Icon from '../common/icons';

/**
 * ShareModal
 *
 * Share sheet for a property listing. Supports native share where available,
 * copy-to-clipboard with fallback, and direct share links.
 */
export default function ShareModal({ open, onClose, url, title = 'Check out this property on RentLink' }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  useEffect(() => {
    if (open) {
      setCopied(false);
      setError('');
    }
  }, [open]);

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    { label: 'WhatsApp', icon: 'chat', href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`, color: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100' },
    { label: 'Email', icon: 'mail', href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`, color: 'text-slate-600 bg-slate-50 hover:bg-slate-100 border-slate-200' },
    { label: 'Facebook', icon: 'share', href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, color: 'text-primary-600 bg-primary-50 hover:bg-primary-100 border-primary-100' },
  ];

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        inputRef.current?.select();
        document.execCommand('copy');
      }
      setCopied(true);
      setError('');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError('Copy failed. Select the link and copy it manually.');
    }
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({ title, url: shareUrl });
      onClose?.();
    } catch {
      /* user cancelled or share failed — fall back to links below */
    }
  };

  const canNativeShare = typeof navigator !== 'undefined' && Boolean(navigator.share);

  return (
    <Modal open={open} onClose={onClose} title="Share property">
      <div className="space-y-5">
        {/* Direct share links */}
        <div className="flex flex-wrap gap-3">
          {shareLinks.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition ${s.color}`}
            >
              <Icon name={s.icon} size={16} aria-hidden="true" />
              {s.label}
            </a>
          ))}
        </div>

        {/* Copy link */}
        <div>
          <label htmlFor="share-link" className="mb-1.5 block text-xs font-medium text-slate-500">
            Link
          </label>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              id="share-link"
              type="text"
              readOnly
              value={shareUrl}
              onFocus={(e) => e.target.select()}
              className="h-11 min-w-0 flex-1 rounded-xl border border-line bg-slate-50 px-3 text-sm text-slate-600 outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
            />
            <Button onClick={handleCopy} variant="primary">
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
          {error && (
            <p className="mt-1.5 text-xs font-medium text-rose-600" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* Native share */}
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink transition hover:bg-slate-50"
          >
            <Icon name="share" size={16} aria-hidden="true" />
            More share options
          </button>
        )}

        {/* Confirmation */}
        <div aria-live="polite" className="min-h-0">
          {copied && (
            <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700">
              <Icon name="check" size={16} aria-hidden="true" className="mt-px shrink-0" />
              Link copied to clipboard
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
