import { useId } from 'react';
import { cn } from '../../utils/format';

export default function PublicPageHero({
  eyebrow,
  title,
  description,
  meta,
  aside,
  image = 'https://lh3.googleusercontent.com/aida-public/AB6AXuB2i0831S2a5iL6ICB8KsmDlbHVqfSuMAlydKwHwBc_bnVndgNL9vO-jIObimvWaMApfkidtsiHr6gA1GlFY0biVw5V-6WBK2BCrywo7dgSmwa-qAO9P73ekr1ru-KqtzCATSFL1DBK2qriUhHRWxV4Dqk7hwoNNxO1rqHJ6A7bumF7_IuR7x-ifh2j-H_voltOPyvvk5JOHwV05k0qjfuTPDsQ7a63cpq5_yiIFobomZKRsDFTnT36',
  imagePosition = 'center',
  compact = false,
  className,
}) {
  const headingId = useId();

  return (
    <section
      className={cn(
        'relative w-full -mt-20 overflow-hidden bg-[#0B1320] text-white pt-36 pb-20 lg:pt-44 lg:pb-24 border-b border-white/10',
        compact && 'pt-32 pb-14 lg:pt-36 lg:pb-16',
        className
      )}
      aria-labelledby={headingId}
    >
      {/* Background with Dark Scrim Gradients */}
      {image && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover opacity-25 scale-105"
            style={{ objectPosition: imagePosition }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320] via-[#0B1320]/60 to-[#0B1320]/90" />
        </div>
      )}

      {/* Atmospheric Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FE932C]/15 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-[#059669]/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        <div className={cn('grid grid-cols-1 gap-8 items-end', aside && 'lg:grid-cols-12')}>
          <div className={cn('min-w-0', aside ? 'lg:col-span-8' : 'max-w-3xl')}>
            {eyebrow && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#FE932C] text-xs font-bold uppercase tracking-wider mb-4">
                {eyebrow}
              </span>
            )}
            <h1 id={headingId} className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              {title}
            </h1>
            {description && (
              <p className="mt-4 text-base sm:text-lg text-slate-300 leading-relaxed font-sans max-w-2xl">
                {description}
              </p>
            )}
            {meta && (
              <p className="mt-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {meta}
              </p>
            )}
          </div>

          {aside && <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">{aside}</div>}
        </div>
      </div>
    </section>
  );
}
