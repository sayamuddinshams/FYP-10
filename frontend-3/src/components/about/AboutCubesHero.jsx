import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Home,
  Building2,
  Compass,
  UserCheck,
  ShieldCheck,
  MountainSnow,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../utils/format';
import { BackgroundCubesGrid } from '../ui/background-cubes-grid';

const communities = [
  {
    word: 'mountain families',
    bg: '#2563eb',
    fg: '#ffffff',
    icon: Home,
  },
  {
    word: 'independent homeowners',
    bg: '#d97706',
    fg: '#ffffff',
    icon: Building2,
  },
  {
    word: 'visiting professionals',
    bg: '#059669',
    fg: '#ffffff',
    icon: UserCheck,
  },
  {
    word: 'expedition teams',
    bg: '#ea580c',
    fg: '#ffffff',
    icon: Compass,
  },
  {
    word: 'vetted liaisons',
    bg: '#7c3aed',
    fg: '#ffffff',
    icon: ShieldCheck,
  },
  {
    word: '10 northern districts',
    bg: '#FE932C',
    fg: '#0B1320',
    icon: MountainSnow,
  },
];

const EASE_OUT = [0.215, 0.61, 0.355, 1];
const STAGGER = 0.08;
const START = 0.15;

const TONES = {
  dark: {
    bg: 'bg-[#0B1320]',
    heading: 'text-white',
    body: 'text-slate-300',
    note: 'text-slate-400',
    pill: 'bg-white/10 text-white border border-white/15 backdrop-blur-md shadow-[0_2px_10px_rgba(0,0,0,0.3)] hover:border-amber-400/60 hover:bg-white/15',
    primary:
      'bg-amber-500 text-slate-950 font-bold shadow-lg hover:bg-amber-400 active:scale-95 transition-all',
    secondary:
      'bg-white/10 text-white font-semibold border border-white/20 hover:bg-white/15 active:scale-95 transition-all',
  },
  light: {
    bg: 'bg-[#F8FAFC]',
    heading: 'text-[#0B1320]',
    body: 'text-slate-600',
    note: 'text-slate-500',
    pill: 'bg-white text-[#0B1320] border border-slate-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:border-amber-400 hover:shadow-md',
    primary:
      'bg-[#0B1320] text-white font-bold shadow-md hover:bg-slate-850 active:scale-95 transition-all',
    secondary:
      'bg-white text-slate-800 font-semibold border border-slate-300 hover:bg-slate-50 active:scale-95 transition-all',
  },
};

function InlinePill({ item, delay, tone }) {
  const reduceMotion = useReducedMotion();
  const IconComponent = item.icon;

  return (
    <motion.span
      initial={reduceMotion ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
      className={cn(
        'mx-[0.05em] inline-flex translate-y-[-0.05em] items-center gap-[0.28em] rounded-full py-[0.08em] pr-[0.44em] pl-[0.14em] align-middle text-[0.72em] font-sans font-bold leading-none cursor-default transition-all duration-300 hover:scale-105',
        TONES[tone].pill
      )}
    >
      <span
        className="inline-flex size-[1.18em] items-center justify-center rounded-full shadow-xs shrink-0"
        style={{ backgroundColor: item.bg, color: item.fg }}
      >
        <IconComponent className="size-[0.6em]" strokeWidth={2.4} />
      </span>
      <span>{item.word}</span>
    </motion.span>
  );
}

export function AboutCubesHero({ tone = 'dark', className = '' }) {
  const reduceMotion = useReducedMotion();
  const t = TONES[tone];
  const [families, homeowners, professionals, expeditions, liaisons, districts] = communities;

  const pill = (item, suffix = '') => (
    <span className="whitespace-nowrap">
      <InlinePill item={item} tone={tone} delay={START + communities.indexOf(item) * STAGGER} />
      {suffix}
    </span>
  );

  const fadeUp = (delay) => ({
    initial: reduceMotion ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE_OUT, delay },
  });

  return (
    <section
      className={cn(
        'relative isolate flex min-h-[44rem] sm:min-h-[46rem] w-full items-center justify-center overflow-hidden -mt-20 pt-32 sm:pt-36 md:pt-40 pb-16 px-5 sm:px-8 border-b border-white/10 select-none',
        t.bg,
        className
      )}
    >
      {/* 3D Isometric Geometric Cubes Grid in Background */}
      <BackgroundCubesGrid
        className="-z-10"
        cubeSize={36}
        strokeColor={tone === 'dark' ? 'rgba(254, 147, 44, 0.14)' : 'rgba(217, 119, 6, 0.12)'}
      />

      {/* Ambient Radial Vignette Lighting */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] rounded-full blur-[140px] opacity-25 -z-10"
        style={{ backgroundColor: '#FE932C' }}
      />

      {/* Hero Central Content */}
      <div className="relative z-10 mx-auto flex max-w-[1080px] flex-col items-center text-center antialiased">
        {/* Eyebrow Badge */}
        <motion.div
          {...fadeUp(0.05)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 text-xs font-bold uppercase tracking-widest text-[#FE932C] mb-6 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '9s' }} />
          <span>The RentLink Mission & Network</span>
        </motion.div>

        {/* Editorial Heading with Embedded Animated Community Pills */}
        <h1
          className={cn(
            'max-w-[28ch] text-[clamp(28px,4.3vw,54px)] leading-[1.3] font-serif font-medium tracking-[-0.025em] text-balance',
            t.heading
          )}
        >
          Connecting {pill(families, ',')} {pill(homeowners, ',')} {pill(professionals, ',')}{' '}
          {pill(expeditions, ',')} and {pill(liaisons)} across {pill(districts)} in one verified sanctuary.
        </h1>

        {/* Narrative Mission Paragraph */}
        <motion.p
          {...fadeUp(0.68)}
          className={cn(
            'mt-6 max-w-[640px] text-[clamp(15px,1.4vw,18px)] leading-[1.65] font-sans text-pretty',
            t.body
          )}
        >
          RentLink replaces chaotic broker networks and phone rumors with human-verified property profiles,
          audited land records, and transparent 5% community pricing across Gilgit-Baltistan.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          {...fadeUp(0.78)}
          className="pointer-events-auto mt-8 flex flex-col items-center gap-3 sm:flex-row"
        >
          <Link
            to="/browse"
            className={cn(
              'inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-bold shadow-xl hover:scale-105 active:scale-95 transition-all',
              t.primary
            )}
          >
            <span>Browse Sanctuaries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/story"
            className={cn(
              'inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold transition-all hover:scale-105 active:scale-95',
              t.secondary
            )}
          >
            <span>Read Our Journey</span>
          </Link>
        </motion.div>

        {/* Trust Badges */}
        <motion.p {...fadeUp(0.88)} className={cn('mt-5 text-xs sm:text-sm font-medium', t.note)}>
          Human-inspected deeds · Bukhari-heated verification · Zero hidden broker fees
        </motion.p>
      </div>
    </section>
  );
}

export default AboutCubesHero;
