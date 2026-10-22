import React from 'react';
import { Link } from 'react-router-dom';
import {
  MountainSnow,
  Home,
  Building2,
  Hotel,
  Flame,
  Trees,
  Compass,
  MapPin,
  Wifi,
  Zap,
  ShieldCheck,
  BadgeCheck,
  Key,
  Plane,
  Car,
  Landmark,
  Coffee,
  Utensils,
  Bed,
  Camera,
  Sun,
  Tent,
  Warehouse,
  Megaphone,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

/**
 * 4 Curated Sets of Northern Pakistan Mountain Badges & Interspersed Dark Blank Tiles
 */
const row1 = [
  { icon: MountainSnow, name: 'Karakoram Sanctuaries', color: '#0284c7', bg: '#f0f9ff' },
  { blank: true },
  { icon: Home, name: 'Alpine Stone Cottages', color: '#0b1320', bg: '#ffffff' },
  { icon: Hotel, name: 'High-Altitude Resorts', color: '#d97706', bg: '#fef3c7' },
  { blank: true },
  { icon: Trees, name: 'Valley Eco-Retreats', color: '#059669', bg: '#ecfdf5' },
  { icon: Compass, name: 'Northern Expeditions', color: '#b45309', bg: '#fef3c7' },
  { blank: true },
  { icon: Wifi, name: 'Mountain Fibre Optic', color: '#2563eb', bg: '#eff6ff' },
  { icon: Flame, name: 'Bukhari Heating', color: '#ea580c', bg: '#fff7ed' },
  { blank: true },
  { icon: ShieldCheck, name: 'Verified Land Deeds', color: '#10b981', bg: '#d1fae5' },
];

const row2 = [
  { blank: true },
  { icon: Plane, name: 'Scenic Mountain Air', color: '#0284c7', bg: '#f0f9ff' },
  { icon: Building2, name: 'Commercial & Suites', color: '#6366f1', bg: '#eef2ff' },
  { blank: true },
  { icon: Coffee, name: 'Mountain Orchard Cafes', color: '#78350f', bg: '#fef3c7' },
  { icon: BadgeCheck, name: 'Certified Hosts', color: '#047857', bg: '#ecfdf5' },
  { blank: true },
  { icon: Car, name: '4x4 KKH Logistics', color: '#334155', bg: '#f8fafc' },
  { icon: Utensils, name: 'Authentic Balti Cuisine', color: '#be185d', bg: '#fdf2f8' },
  { blank: true },
  { icon: Landmark, name: 'Heritage Forts & AKDN', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: Key, name: 'Turnkey Move-in Ready', color: '#d97706', bg: '#fef3c7' },
];

const row3 = [
  { icon: Zap, name: 'Hydro & Solar Clean Grid', color: '#ca8a04', bg: '#fefce8' },
  { blank: true },
  { icon: Bed, name: 'Serviced Valley Suites', color: '#2563eb', bg: '#eff6ff' },
  { icon: MapPin, name: '10 Regional GB Hubs', color: '#e11d48', bg: '#fff1f2' },
  { blank: true },
  { icon: Sun, name: 'High-Altitude Solar', color: '#f59e0b', bg: '#fffbeb' },
  { icon: Tent, name: 'Base Camps & Glamping', color: '#15803d', bg: '#f0fdf4' },
  { blank: true },
  { icon: Camera, name: 'Architectural HDR Tours', color: '#db2777', bg: '#fdf2f8' },
  { icon: Warehouse, name: 'Building Materials Supply', color: '#475569', bg: '#f8fafc' },
  { blank: true },
  { icon: Sparkles, name: 'Featured Spotlight', color: '#eab308', bg: '#fef9c3' },
];

const row4 = [
  { icon: Megaphone, name: 'Spotlight Campaigns', color: '#f97316', bg: '#fff7ed' },
  { blank: true },
  { icon: Hotel, name: 'Hunza Heritage Lodges', color: '#d97706', bg: '#fef3c7' },
  { icon: MountainSnow, name: 'Passu Cones Sanctuaries', color: '#0284c7', bg: '#f0f9ff' },
  { blank: true },
  { icon: Trees, name: 'Pine Forest Cabins', color: '#059669', bg: '#ecfdf5' },
  { blank: true },
  { icon: Home, name: 'Vetted Mountain Homes', color: '#0b1320', bg: '#ffffff' },
  { icon: Wifi, name: 'Remote Valley Telecom', color: '#2563eb', bg: '#eff6ff' },
  { blank: true },
  { icon: Flame, name: 'Winter Thermal Hearth', color: '#ea580c', bg: '#fff7ed' },
  { icon: ShieldCheck, name: 'Verified Ownership', color: '#10b981', bg: '#d1fae5' },
];

function MarqueeRow({ items, direction = 'left', duration = '40s' }) {
  const loopItems = [...items, ...items, ...items];

  return (
    <div className="relative flex overflow-hidden py-1 sm:py-1.5 select-none">
      <div
        className={`flex shrink-0 items-center gap-2.5 sm:gap-3.5 md:gap-4 will-change-transform hover:[animation-play-state:paused] ${
          direction === 'left' ? 'animate-marquee-track-left' : 'animate-marquee-track-right'
        }`}
        style={{
          animationDuration: duration,
        }}
      >
        {loopItems.map((item, idx) => {
          if (item.blank) {
            return (
              <div
                key={idx}
                className="aspect-square w-12 sm:w-14 md:w-16 lg:w-[68px] rounded-[16px] sm:rounded-[18px] md:rounded-[20px] border border-white/[0.04] bg-[#19243a]/75 shrink-0 transition-transform duration-300 hover:scale-105"
              />
            );
          }

          const Icon = item.icon;
          return (
            <div
              key={idx}
              title={item.name}
              className="group flex aspect-square w-12 sm:w-14 md:w-16 lg:w-[68px] shrink-0 items-center justify-center rounded-[16px] sm:rounded-[18px] md:rounded-[20px] border border-white/[0.06] shadow-md shadow-black/20 transition-all duration-300 hover:scale-110 hover:shadow-xl cursor-default"
              style={{ backgroundColor: item.bg }}
            >
              <Icon
                className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 transition-transform duration-300 group-hover:scale-110"
                strokeWidth={2.3}
                style={{ color: item.color }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CompanyCardsHero({
  eyebrow = 'Marketplace Partner & Advertising Network',
  title = 'Amplify your mountain brand across Northern Pakistan.',
  subtitle = 'Showcase your sanctuaries, resorts, adventure expeditions, and local services directly to thousands of verified tenants, hosts, and travelers across Gilgit-Baltistan.',
  accentColor = '#4779ff',
  advertiseHref = '/owner/dashboard',
  advertiseLabel = 'Advertise Now',
  onAdvertiseClick,
  className = '',
}) {
  return (
    <section
      className={`relative isolate min-h-[760px] sm:min-h-[800px] md:min-h-[840px] -mt-20 overflow-hidden bg-[#0d1424] px-4 pt-36 sm:pt-40 md:pt-44 pb-12 text-white border-b border-white/10 ${className}`}
    >
      <style>{`
        @keyframes marquee-track-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333333%, 0, 0); }
        }
        @keyframes marquee-track-right {
          0% { transform: translate3d(-33.333333%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-marquee-track-left {
          animation: marquee-track-left linear infinite;
        }
        .animate-marquee-track-right {
          animation: marquee-track-right linear infinite;
        }
      `}</style>

      {/* Background ambient radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-20 -translate-x-1/2 w-[650px] h-[320px] rounded-full blur-[140px] opacity-25"
        style={{ backgroundColor: accentColor }}
      />

      {/* Hero Content */}
      <div className="relative z-20 mx-auto max-w-4xl px-4 text-center">
        <p
          className="mb-4 text-xs sm:text-[13px] font-semibold tracking-[0.16em] uppercase"
          style={{ color: accentColor }}
        >
          {eyebrow}
        </p>

        <h1 className="text-3xl font-medium leading-[1.12] tracking-[-0.035em] sm:text-5xl md:text-[52px]">
          <span className="block text-[#f3f5fa] font-serif">
            {title}
          </span>
        </h1>

        <p className="mt-4 block text-[#8995aa] text-sm sm:text-base md:text-lg font-normal max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      </div>

      {/* Responsive Horizontal Marquee Rows Container */}
      <div className="relative z-10 mt-10 sm:mt-12 md:mt-14 w-full overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 sm:w-28 md:w-48 bg-gradient-to-r from-[#0d1424] via-[#0d1424]/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 sm:w-28 md:w-48 bg-gradient-to-l from-[#0d1424] via-[#0d1424]/80 to-transparent" />

        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-10 sm:h-14 bg-gradient-to-b from-[#0d1424] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-10 sm:h-14 bg-gradient-to-t from-[#0d1424] to-transparent" />

        {/* Center CTA Button */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-auto flex items-center justify-center">
          <div className="pointer-events-none absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 blur-2xl opacity-75 -z-10" />

          <div className="p-1.5 sm:p-2 rounded-full bg-white/[0.08] backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.85),0_0_30px_rgba(245,158,11,0.2)] ring-1 ring-white/10">
            {onAdvertiseClick ? (
              <button
                type="button"
                onClick={onAdvertiseClick}
                className="group relative flex items-center gap-3 sm:gap-3.5 rounded-full bg-[#0b1320]/75 hover:bg-[#0b1320]/90 px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-2xl backdrop-blur-xl border border-white/25 hover:border-amber-400/90 transition-all duration-300 hover:scale-[1.03] active:scale-95"
              >
                <div className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>

                <span className="tracking-wider uppercase font-semibold text-white group-hover:text-amber-300 transition-colors">
                  {advertiseLabel}
                </span>

                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </button>
            ) : (
              <Link
                to={advertiseHref}
                className="group relative flex items-center gap-3 sm:gap-3.5 rounded-full bg-[#0b1320]/75 hover:bg-[#0b1320]/90 px-6 sm:px-8 py-3 sm:py-3.5 text-xs sm:text-sm font-bold text-white shadow-2xl backdrop-blur-xl border border-white/25 hover:border-amber-400/90 transition-all duration-300 hover:scale-[1.03] active:scale-95"
              >
                <div className="pointer-events-none absolute inset-x-4 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent" />

                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
                </span>

                <span className="tracking-wider uppercase font-semibold text-white group-hover:text-amber-300 transition-colors">
                  {advertiseLabel}
                </span>

                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 group-hover:bg-amber-500 group-hover:text-black transition-all duration-300">
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Link>
            )}
          </div>
        </div>

        {/* 4 Alternating Horizontal Moving Rows */}
        <div className="flex flex-col gap-1 sm:gap-2">
          <MarqueeRow items={row1} direction="left" duration="52s" />
          <MarqueeRow items={row2} direction="right" duration="58s" />
          <MarqueeRow items={row3} direction="left" duration="48s" />
          <MarqueeRow items={row4} direction="right" duration="55s" />
        </div>
      </div>
    </section>
  );
}
