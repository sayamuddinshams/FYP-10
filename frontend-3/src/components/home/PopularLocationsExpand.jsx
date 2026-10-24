import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ArrowRight,
  Sparkles,
  Mountain,
  ChevronRight,
} from 'lucide-react';
import { cn } from '../../utils/format';

/**
 * Enriched Regional Mountain Destinations across Northern Pakistan
 */
const DESTINATIONS = [
  {
    name: 'Hunza',
    district: 'Hunza',
    code: '# 01',
    elevation: '2,438m',
    tagline: 'Passu Cones, Rakaposhi views & Karimabad apricot orchards.',
    vibe: 'Alpine Heritage',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Skardu',
    district: 'Skardu',
    code: '# 02',
    elevation: '2,228m',
    tagline: 'Gateway to K2, Sarfaranga cold desert & Shangrila lakeside chalets.',
    vibe: 'High-Altitude Frontier',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Gilgit',
    district: 'Gilgit',
    code: '# 03',
    elevation: '1,500m',
    tagline: 'Regional capital, Jutial business suites & historic Silk Route hub.',
    vibe: 'Commercial Capital',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Nagar',
    district: 'Nagar',
    code: '# 04',
    elevation: '2,688m',
    tagline: 'Hopar glacier retreats, Spantik vistas & terraced stone homes.',
    vibe: 'Glacial Valleys',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Ghizer',
    district: 'Ghizer',
    code: '# 05',
    elevation: '2,410m',
    tagline: 'Phander lake turquoise waters, Gahkuch riverfront & trout valleys.',
    vibe: 'Emerald Waters',
    image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Astore',
    district: 'Astore',
    code: '# 06',
    elevation: '2,600m',
    tagline: 'Rama Meadows pine forests & Nanga Parbat Rupal face foothills.',
    vibe: 'Pine Sanctuary',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Shigar',
    district: 'Shigar',
    code: '# 07',
    elevation: '2,250m',
    tagline: 'Fong-Khar palace heritage & fertile oasis on the Karakoram trail.',
    vibe: 'Royal Oasis',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Kharmang',
    district: 'Kharmang',
    code: '# 08',
    elevation: '2,300m',
    tagline: 'Manthokha waterfalls & pristine Indus river valley residences.',
    vibe: 'Cascade Terraces',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function PopularLocationsExpand({ stats, className = '' }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();

  return (
    <div className={cn('w-full', className)}>
      {/* ========================================================================= */}
      {/* 1. DESKTOP & TABLET ACCORDION (Skiper 52 HoverExpand Interaction)        */}
      {/* ========================================================================= */}
      <div className="hidden md:block w-full">
        <div className="flex w-full items-center justify-center gap-2 lg:gap-2.5 h-[28rem] select-none">
          {DESTINATIONS.map((dest, index) => {
            const isActive = activeIndex === index;
            const count = stats?.byDistrict?.[dest.district] || 0;

            return (
              <motion.div
                key={dest.name}
                className="group relative cursor-pointer overflow-hidden rounded-[26px] h-full shadow-lg border border-white/10"
                initial={false}
                animate={{
                  width: isActive ? '24rem' : '4.75rem',
                }}
                transition={{
                  duration: 0.42,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onHoverStart={() => setActiveIndex(index)}
                onClick={() => {
                  if (isActive) {
                    navigate(`/browse?districts=${encodeURIComponent(dest.district)}`);
                  } else {
                    setActiveIndex(index);
                  }
                }}
              >
                {/* Background Destination Photo */}
                <img
                  src={dest.image}
                  alt={dest.name}
                  className={cn(
                    'absolute inset-0 size-full object-cover transition-all duration-700 ease-out',
                    isActive ? 'scale-105 opacity-90' : 'scale-100 opacity-60 group-hover:opacity-75'
                  )}
                />

                {/* Ambient Scrim Gradients */}
                <div
                  className={cn(
                    'absolute inset-0 transition-opacity duration-300',
                    isActive
                      ? 'bg-gradient-to-t from-[#0B1320] via-[#0B1320]/45 to-transparent opacity-95'
                      : 'bg-[#0B1320]/60 group-hover:bg-[#0B1320]/40'
                  )}
                />

                {/* Top Frosted Sheen Highlight */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/35 to-transparent" />

                {/* =============================================================== */}
                {/* COLLAPSED STATE: Slim Vertical Pillar with Code & Valley Name  */}
                {/* =============================================================== */}
                {!isActive && (
                  <div className="relative flex h-full w-full flex-col justify-between items-center py-6 px-1.5 z-10">
                    <span className="text-[11px] font-bold tracking-widest text-[#FFDCC3] opacity-80">
                      {dest.code}
                    </span>

                    <div className="flex flex-col items-center gap-2">
                      <span className="text-white/80 group-hover:text-amber-300 font-serif font-bold text-sm tracking-wider uppercase [writing-mode:vertical-rl] rotate-180 transition-colors">
                        {dest.name}
                      </span>
                    </div>

                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 group-hover:bg-amber-500/80 text-white group-hover:text-black transition-all">
                      <Mountain className="w-3.5 h-3.5" />
                    </div>
                  </div>
                )}

                {/* =============================================================== */}
                {/* EXPANDED STATE: Rich Interactive Sanctuary Showcase Card       */}
                {/* =============================================================== */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="relative z-10 flex h-full w-full flex-col justify-between p-6 text-white text-left"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FE932C] text-[#0B1320] text-xs font-bold shadow-md">
                            <Sparkles className="w-3 h-3" />
                            <span>{dest.vibe}</span>
                          </span>

                          <span className="text-xs font-mono font-semibold text-white/80 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/15">
                            {dest.elevation}
                          </span>
                        </div>

                        <span className="text-xs font-bold text-white/60">
                          {dest.code}
                        </span>
                      </div>

                      {/* Bottom Info Panel */}
                      <div className="mt-auto">
                        {/* Live Listings Pill */}
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-[11px] font-medium text-emerald-300 mb-2.5">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                          <span>{count > 0 ? `${count} active sanctuaries` : 'Verified valley listings'}</span>
                        </div>

                        {/* Title */}
                        <h3 className="font-serif text-3xl font-bold tracking-tight text-white mb-1.5">
                          {dest.name} Valley
                        </h3>

                        {/* Tagline */}
                        <p className="text-xs sm:text-sm text-slate-200 line-clamp-2 leading-relaxed mb-4">
                          {dest.tagline}
                        </p>

                        {/* CTA Button */}
                        <Link
                          to={`/browse?districts=${encodeURIComponent(dest.district)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 px-5 py-2.5 text-xs font-bold shadow-xl transition-all hover:scale-105 active:scale-95"
                        >
                          <span>Explore Sanctuaries</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. MOBILE RESPONSIVE CAROUSEL / ACCORDION (Swipeable Cards)              */}
      {/* ========================================================================= */}
      <div className="block md:hidden w-full">
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory thin-scrollbar -mx-4 px-4">
          {DESTINATIONS.map((dest) => {
            const count = stats?.byDistrict?.[dest.district] || 0;
            return (
              <Link
                key={dest.name}
                to={`/browse?districts=${encodeURIComponent(dest.district)}`}
                className="relative snap-center shrink-0 w-[78vw] sm:w-[320px] h-[22rem] rounded-2xl overflow-hidden shadow-lg border border-white/10 group text-left"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320] via-[#0B1320]/40 to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FE932C] text-[#0B1320] text-[11px] font-bold">
                      {dest.vibe}
                    </span>
                    <span className="text-xs font-mono text-white/70">{dest.elevation}</span>
                  </div>

                  <div>
                    <span className="text-xs text-amber-300 font-semibold flex items-center gap-1 mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {count > 0 ? `${count} active listings` : 'Explore valley'}
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-white">{dest.name}</h3>
                    <p className="text-xs text-slate-300 line-clamp-2 mt-1">{dest.tagline}</p>

                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-amber-400 group-hover:text-amber-300">
                      <span>View Sanctuaries</span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
