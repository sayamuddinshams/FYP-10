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
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9ydod2w4m0R6eENCW1x093Ju7VKJtfD-Awryc-8CSWfvhYIATyMMV3hTuoEDlmTneLf5Mh81Anxl95dfCz1bHl7I5cpJT9f1SYMLJ2hkk5lTP2EgU31edjE314414FbiIgrzdBOkRUd1tlVGQn0jx7vaA1Tglxp8gqmRDSN2Rz-UcVpZz88lDj5cgxsMjebKNJcaHdkq1lUtuplJtrddIz__fEYBDaZDi2sqJODeu39KO4O3idd5',
  },
  {
    name: 'Skardu',
    district: 'Skardu',
    code: '# 02',
    elevation: '2,228m',
    tagline: 'Gateway to K2, Sarfaranga cold desert & Shangrila lakeside chalets.',
    vibe: 'High-Altitude Frontier',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDhQHejAgvffKTppC1OBs56YFRAjkKUT_xjlDvg_hy4tqctr7t76r68iY_o7MN83zcXmcOQvS0_UI59IHaFQEdAKj602AeUIYZI1qV3WjP7uCKDMIHXp0zqLmAXuEzTIdpdaomatIzDBkR00G6KxwDM2kkD-ET8m7JnuwbamR1R0I1vWQ5XIp0X0q0bReYJm2IrinA8168bZrIScbb5WHjOlaU2rMM7orbqO87o-y8N-mSgiok1-EBo',
  },
  {
    name: 'Gilgit',
    district: 'Gilgit',
    code: '# 03',
    elevation: '1,500m',
    tagline: 'Regional capital, Jutial business suites & historic Silk Route hub.',
    vibe: 'Commercial Capital',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD4NgeIeM-_xuKr1Bm9byzdbhrL0GO8XoJ4kM0r8nfN3uGh9GV7eP09qvvAnpg_ydt0NQxvSFgenUNiBdLNHGR61ozzLaj69iq_S53QO1Yg833iAv7tGVEEr5yHC7s5dlCACrhXlwh-8_ZgWl70mmZAU2N7VIAKXWbR_IrhEdJ3Ad8PAtHJp3DU-_R3zhbPdqyPJaHTNUbiYJQQT6XP6BXzzw6b27Pacm-BU-O8bM4xOHCEDuIeN_Ui',
  },
  {
    name: 'Nagar',
    district: 'Nagar',
    code: '# 04',
    elevation: '2,688m',
    tagline: 'Hopar glacier retreats, Spantik vistas & terraced stone homes.',
    vibe: 'Glacial Valleys',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAUWoksTcM_jqqV7GoUC81poO9nk4u1Sv1DComkJ7RCn25q1lLj8AmpTWWEHKoMC7T66SICA4IbYspuvJRkaKGJAGi1qz6Xhhk19sEl1F4TzLndE6tDuuZjyCnV3_DmxbIOj7JTLH7_mLjhp4GSpkwJ0-skrg9e3h78dy5rrwUWcnXnYMPbCSTtQ9BPccn_bVCkKLKQEvmk5STFPv9CAWW4huUvFAWss7b4EYX6BmJCMaW0Fwu5_bo8',
  },
  {
    name: 'Ghizer',
    district: 'Ghizer',
    code: '# 05',
    elevation: '2,410m',
    tagline: 'Phander lake turquoise waters, Gahkuch riverfront & trout valleys.',
    vibe: 'Emerald Waters',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDywsWpoo50pwZT78qD2q0tU49ZkNEAHA8trv0a75MFgi9MjghNH5DvJ1PA3lMns6-bN41FtTm6OIHeVl4nhez_AT4C9H1feEnG2JK6IDNA_XFbQR9E2KygH1PAJIOeBNu4lHJ_eVVVu1KeyvLq4nMmvGRY0x6OaBWO1Ac9gaixn4yc9gWyY8xnxJLNM5An8Cc0DN7shXahPL1g77R_V8ZDloxq2xsJtdSXngjRmqOxMuoXJEja-KZn',
  },
  {
    name: 'Astore',
    district: 'Astore',
    code: '# 06',
    elevation: '2,600m',
    tagline: 'Rama Meadows pine forests & Nanga Parbat Rupal face foothills.',
    vibe: 'Pine Sanctuary',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCr7iyaI2_JgFerVUHu2M2Of9YQgdsrQUlFOC4gvA4P11IDW317NTig23qjZw1l0QQ45LyL1ju2hsnKC2UzBb17Hb6PRVPCGW5AS1h6z83BUvKVTFOpso6psoLeBn3Gm2puCTB9tOYauB57U15J66E1xHoyXxQW-7phykhM15vt4TnUTk8CF_GtR9HC3W6vBW4aU4GsgCNNkgmKKgTPgK6P02D1FlBAlKvNnQCI_u42y2GkiaRGDsy1',
  },
  {
    name: 'Shigar',
    district: 'Shigar',
    code: '# 07',
    elevation: '2,250m',
    tagline: 'Fong-Khar palace heritage & fertile oasis on the Karakoram trail.',
    vibe: 'Royal Oasis',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAapwTooEjqbjCN-DSDLFGDI8h_MZ00eLfhQGlXLjhPgyyIKJhTt8-EhVjBvq_BMBm-utBMa8cn8_lXeLX6P8ZE8FJPZ4cQluegK7qoXKKM4x_lwFMnninsTifh6ZNI2fhYmzl2QgfC6224jkBnskSm3B4naB8b7CDZbq1VIvLk4T9G42Z9v0dpjVRvTUKvIPLGs7FGWCGGq6WGIfTAyHi6AXZcac8RUfqdMYDjAozwVmOEaFJXblrm',
  },
  {
    name: 'Kharmang',
    district: 'Kharmang',
    code: '# 08',
    elevation: '2,300m',
    tagline: 'Manthokha waterfalls & pristine Indus river valley residences.',
    vibe: 'Cascade Terraces',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBTrXHFVh3JWRdpICtgrcrLcWeBRC5s6v3OBz37VbX_u25hY-NkTTMvdyqRwys4OJPnqHR1D52O_dov0aI1Nj_eVBL9HxytJcl7_P-SVgnNh0gi3AFVQZ0DlHdgHF5VjwOhIqquaCiklj45RCh23lYosXLIE4gs1gJJ2OAkMashocY863gm2HODj6I6x7GMnd5evbpjkivvxnDaGReBiKQeAeLwx7FGdbvTk9hnG2xc8Xm8sKiJRnq-',
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
