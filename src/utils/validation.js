export function validateEmail(value) {
  const v = (value || '').trim();
  if (!v) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address.';
  return '';
}

export function validatePassword(value, { required = true } = {}) {
  const v = value || '';
  if (!v) return required ? 'Password is required.' : '';
  if (v.length < 6) return 'Password must be at least 6 characters.';
  return '';
}

export function validateRequired(value, message = 'This field is required.') {
  if (value === null || value === undefined) return message;
  if (typeof value === 'string' && !value.trim()) return message;
  if (Array.isArray(value) && !value.length) return message;
  return '';
}

export function validateMatch(a, b, message = 'Passwords do not match.') {
  if (a !== b) return message;
  return '';
}

export function validateMin(value, min, message) {
  const n = Number(value);
  if (!value && value !== 0) return message;
  if (Number.isNaN(n)) return message;
  if (n < min) return message;
  return '';
}

export function validateDate(value, message = 'Choose a valid date.') {
  if (!value) return message;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return message;
  return '';
}

export function validateFutureDate(value, message = 'Choose a future date.') {
  const err = validateDate(value);
  if (err) return err;
  const chosen = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (chosen < today) return message;
  return '';
}

/** Runs a map of { field: errorString } and returns only the non-empty ones. */
export function pickErrors(errors) {
  const out = {};
  Object.entries(errors).forEach(([k, v]) => {
    if (v) out[k] = v;
  });
  return out;
}

export function firstError(errors) {
  return Object.values(errors)[0] || '';
}
