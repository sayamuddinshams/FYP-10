import { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Icon from '../common/icons';
import { useToast } from '../../context/ToastContext';

export default function ShareModal({ open, onClose, property }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const link = property ? `${window.location.origin}/property/${property.id}` : window.location.origin;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch (err) {
      // fallback for older browsers
      const el = document.createElement('textarea');
      el.value = link;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    toast.success('Link copied to clipboard.', 'Share');
    setTimeout(() => setCopied(false), 2500);
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: property?.title || 'RentLink', text: property?.description, url: link });
        return;
      } catch (err) {
        /* user dismissed the share sheet */
      }
    }
    copy();
  }

  const options = [
    {
      label: 'WhatsApp',
      href: `https://wa.me/?text=${encodeURIComponent(`${property?.title || 'RentLink'} — ${link}`)}`,
      tone: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Email',
      href: `mailto:?subject=${encodeURIComponent(property?.title || 'A property on RentLink')}&body=${encodeURIComponent(link)}`,
      tone: 'bg-brand-50 text-brand-700',
    },
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      tone: 'bg-sky-50 text-sky-600',
    },
  ];

  return (
    <Modal open={open} onClose={onClose} title="Share property" description="Send this listing to someone who might be interested." size="sm">
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-line bg-slate-50 p-2">
          <input readOnly value={link} aria-label="Property link" className="h-9 min-w-0 flex-1 bg-transparent px-2 text-sm text-slate-600 focus:outline-none" />
          <Button size="sm" onClick={copy} className="shrink-0">
            {copied ? 'Copied' : 'Copy link'}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {options.map((opt) => (
            <a
              key={opt.label}
              href={opt.href}
              target="_blank"
              rel="noreferrer"
              className="flex flex-col items-center gap-2 rounded-xl border border-line bg-white px-2 py-3.5 text-center transition hover:border-brand-300 hover:bg-slate-50"
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-full ${opt.tone}`}>
                <Icon name="share" className="h-4.5 w-4.5" />
              </span>
              <span className="text-xs font-semibold text-slate-600">{opt.label}</span>
            </a>
          ))}
        </div>

        <Button variant="outline" fullWidth onClick={nativeShare}>
          <Icon name="send" className="h-4 w-4" />
          More sharing options
        </Button>
      </div>
    </Modal>
  );
}
