import { avatarTone, cn, getInitials } from '../../utils/format';

export default function Avatar({ name = '', src, size = 'md', className = '', ring = false }) {
  const sizes = {
    xs: 'h-7 w-7 text-[10px]',
    sm: 'h-9 w-9 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('shrink-0 rounded-full object-cover', sizes[size], ring && 'ring-2 ring-white', className)}
      />
    );
  }

  return (
    <span
      role="img"
      aria-label={name}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold tracking-wide',
        avatarTone(name),
        sizes[size],
        ring && 'ring-2 ring-white',
        className
      )}
    >
      {getInitials(name)}
    </span>
  );
}
