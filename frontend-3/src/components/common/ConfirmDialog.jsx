import Modal from './Modal';
import Button from './Button';

/** Promise-based confirmation used for every destructive action. */
export default function ConfirmDialog({ state, onConfirm, onCancel }) {
  if (!state) return null;
  const danger = state.tone === 'danger';
  return (
    <Modal
      open={Boolean(state)}
      onClose={onCancel}
      title={state.title}
      size="sm"
      closeOnOverlay={false}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            {state.cancelLabel}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {state.confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex gap-4">
        <div className={danger ? 'mt-0.5 shrink-0 text-red-500' : 'mt-0.5 shrink-0 text-amber-500'}>
          <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
            <path
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-sm leading-relaxed text-slate-600">{state.message}</p>
      </div>
    </Modal>
  );
}
