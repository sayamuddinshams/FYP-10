import { useId } from 'react';
import { cn } from '../../utils/format';

export function FieldLabel({ htmlFor, children, required, hint, hintId }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-wider text-slate-700">
        {children}
        {required && <span className="ml-1 text-[#BA1A1A]" aria-hidden="true">*</span>}
      </label>
      {hint && (
        <span id={hintId} className="text-xs text-slate-500">
          {hint}
        </span>
      )}
    </div>
  );
}

export function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-[#BA1A1A]">
      <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-3.5 w-3.5 shrink-0">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v.5a.75.75 0 001.5 0v-.5zM10 9a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 9z"
          clipRule="evenodd"
        />
      </svg>
      {children}
    </p>
  );
}

const baseInput =
  'w-full rounded-xl border bg-white text-sm text-[#1B1B1D] placeholder:text-slate-400 transition-all duration-200 ' +
  'focus:border-[#D97706] focus:ring-2 focus:ring-[#D97706]/15 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400 shadow-sm';

function stateClass(error) {
  return error ? 'border-[#BA1A1A] focus:border-[#BA1A1A] focus:ring-red-100' : 'border-slate-900/15 hover:border-slate-900/25';
}

function describedBy({ inputId, error, hint }) {
  const ids = [hint ? `${inputId}-hint` : '', error ? `${inputId}-error` : ''].filter(Boolean);
  return ids.length ? ids.join(' ') : undefined;
}

export function Input({ label, error, hint, required, id, className = '', inputClassName = '', rightIcon, ...rest }) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <FieldLabel htmlFor={inputId} required={required} hint={hint} hintId={`${inputId}-hint`}>
          {label}
        </FieldLabel>
      )}
      <div className="relative">
        <input
          id={inputId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy({ inputId, error, hint })}
          className={cn(baseInput, 'h-11 px-3.5', rightIcon && 'pr-11', stateClass(error), inputClassName)}
          {...rest}
        />
        {rightIcon}
      </div>
      <FieldError id={`${inputId}-error`}>{error}</FieldError>
    </div>
  );
}

export function Textarea({ label, error, hint, required, id, rows = 4, className = '', ...rest }) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <FieldLabel htmlFor={inputId} required={required} hint={hint} hintId={`${inputId}-hint`}>
          {label}
        </FieldLabel>
      )}
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={describedBy({ inputId, error, hint })}
        className={cn(baseInput, 'px-3.5 py-2.5 leading-relaxed', stateClass(error))}
        {...rest}
      />
      <FieldError id={`${inputId}-error`}>{error}</FieldError>
    </div>
  );
}

export function Select({ label, error, hint, required, id, children, className = '', selectClassName = '', placeholder, ...rest }) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className={cn('w-full', className)}>
      {label && (
        <FieldLabel htmlFor={inputId} required={required} hint={hint} hintId={`${inputId}-hint`}>
          {label}
        </FieldLabel>
      )}
      <div className="relative">
        <select
          id={inputId}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={describedBy({ inputId, error, hint })}
          className={cn(baseInput, 'h-11 appearance-none pr-9 pl-3.5 cursor-pointer', stateClass(error), selectClassName)}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {children}
        </select>
        <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-slate-500 material-symbols-outlined text-[18px]">
          arrow_drop_down
        </span>
      </div>
      <FieldError id={`${inputId}-error`}>{error}</FieldError>
    </div>
  );
}

export function Checkbox({ label, id, className = '', ...rest }) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <input
        id={inputId}
        type="checkbox"
        className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer rounded border-slate-300 text-[#D97706] accent-[#D97706] focus:ring-[#D97706]/30"
        {...rest}
      />
      {label && (
        <label htmlFor={inputId} className="cursor-pointer text-sm font-medium text-slate-700 select-none">
          {label}
        </label>
      )}
    </div>
  );
}

export function Radio({ label, description, id, checked, className = '', ...rest }) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <input
        id={inputId}
        type="radio"
        checked={checked}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer border-slate-300 text-[#D97706] accent-[#D97706] focus:ring-[#D97706]/30"
        {...rest}
      />
      <label htmlFor={inputId} className="cursor-pointer select-none">
        <span className="block text-sm font-semibold text-slate-800">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-slate-500">{description}</span>}
      </label>
    </div>
  );
}

export default Input;
