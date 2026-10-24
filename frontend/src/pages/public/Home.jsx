import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAsync, useDocumentTitle } from '../../hooks';
import propertyService from '../../services/propertyService';
import { PROPERTY_TYPES } from '../../utils/constants';
import { POPULAR_LOCATIONS } from '../../data/locations';
import PropertyCard from '../../components/property/PropertyCard';
import LocationAutocomplete from '../../components/property/LocationAutocomplete';
import { PropertyCardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import PopularLocationsExpand from '../../components/home/PopularLocationsExpand';

const HERO_POSTER =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAmLKAnVMgYwlQODw7eddXv53dZYfd1wIh1r15wkh0Ml6_FBNFn9db_L95WkKLBUe-06CgSRI5O69KFIaVL2beKQIm4DuIo6jExMe0NO4msJ_bZSM2KyA1eRANg_6s5iRKfxCrYl6AF0Yw8en8G5uHWkDHgLc_2OGlqTnbIQ7mPzLvytTgN9QoQGc59d4JZkgOZlz8E-eUL8bgvq71U2YR-XOafcxboFvYA5pGMc8Ae0uoTlQmJwP_E';

const HERO_VIDEOS = [
  'https://assets.mixkit.co/videos/preview/mixkit-cozy-modern-living-room-in-a-cabin-42790-large.mp4',
  'https://assets.mixkit.co/videos/preview/mixkit-modern-apartment-living-room-with-a-view-42898-large.mp4',
];

const POPULAR_SEARCHES = ['Gilgit', 'Hunza', 'Skardu', 'Karimabad', 'Jutial'];

const TYPE_SHOWCASE = [
  { type: 'house', label: 'House', icon: 'home', count: '5 available', desc: 'Family estates' },
  { type: 'apartment', label: 'Apartment', icon: 'apartment', count: '3 available', desc: 'Scenic views' },
  { type: 'room', label: 'Room', icon: 'single_bed', count: '4 available', desc: 'Single stays' },
  { type: 'hostel', label: 'Hostel', icon: 'group', count: '2 available', desc: 'Student & youth' },
  { type: 'office', label: 'Office', icon: 'domain', count: '2 available', desc: 'Work hubs' },
  { type: 'commercial', label: 'Commercial', icon: 'storefront', count: '2 available', desc: 'Retail & plazas' },
];

export default function Home() {
  useDocumentTitle('Verified Alpine Property Marketplace');
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('all');
  const [searchLocation, setSearchLocation] = useState({ district: '', city: '', area: '', label: 'Jutial, Gilgit' });
  const [searchType, setSearchType] = useState('any');
  const [searchBudget, setSearchBudget] = useState('any');

  const { data: featuredProperties, loading: featuredLoading } = useAsync(
    () => propertyService.getFeatured(9),
    []
  );

  const { data: stats } = useAsync(() => propertyService.stats(), []);

  const filteredProperties = useMemo(() => {
    if (!featuredProperties) return [];
    if (activeCategory === 'all') return featuredProperties.slice(0, 6);
    return featuredProperties.filter((p) => p.type === activeCategory).slice(0, 6);
  }, [featuredProperties, activeCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchLocation.district) params.set('districts', searchLocation.district);
    else if (searchLocation.city) params.set('cities', searchLocation.city);
    else if (searchLocation.area) params.set('areas', searchLocation.area);
    else if (searchLocation.label.trim()) params.set('q', searchLocation.label.trim());

    if (searchType && searchType !== 'any') params.set('type', searchType);
    if (searchBudget === 'under30k') {
      params.set('max', '30000');
    } else if (searchBudget === '30to60k') {
      params.set('min', '30000');
      params.set('max', '60000');
    } else if (searchBudget === '60to100k') {
      params.set('min', '60000');
      params.set('max', '100000');
    } else if (searchBudget === '100kplus') {
      params.set('min', '100000');
    }

    navigate(`/browse?${params.toString()}`);
  };

  return (
    <div className="flex flex-col w-full -mt-20">
      {/* ========================================================================= */}
      {/* 1. HERO SECTION                                                          */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-[#0B1320] text-white">
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <img
            src={HERO_POSTER}
            alt=""
            className="absolute inset-0 w-full h-full object-cover scale-105 opacity-75"
            aria-hidden="true"
          />
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={HERO_POSTER}
            className="relative w-full h-full object-cover scale-105 transition-transform duration-1000 ease-out opacity-65"
          >
            <source src={HERO_VIDEOS[0]} type="video/mp4" />
            <source src={HERO_VIDEOS[1]} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1320] via-[#0B1320]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1320]/80 via-transparent to-[#0B1320]" />
        </div>

        {/* Atmospheric Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[#FE932C]/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[30rem] h-[30rem] rounded-full bg-[#059669]/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12 pt-36 pb-20 lg:pt-44 lg:pb-28 flex flex-col items-center text-center">
          {/* Live Regional Beacon Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-sm mb-6 transition-all hover:bg-white/15 cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#85F8C4] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-white">
              Gilgit-Baltistan, Pakistan
            </span>
          </div>

          {/* Main Heading with Editorial Contrast */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl max-w-4xl tracking-tight text-white leading-[1.15]">
            Find a place that <span className="italic font-normal text-[#FE932C]">feels like home.</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-lg text-slate-300 max-w-2xl text-center leading-relaxed font-sans">
            Discover verified houses, apartments, rooms, hostels, offices and commercial spaces across Gilgit-Baltistan.
          </p>

          {/* Glassmorphic Search Hub Panel */}
          <div className="w-full max-w-4xl mt-10 rounded-2xl backdrop-blur-xl text-left">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col md:flex-row items-center gap-2 md:gap-0 bg-white rounded-2xl md:rounded-full p-2 md:p-1.5 shadow-2xl text-slate-800 text-left border border-white/20"
            >
              {/* Compartment 1: Location */}
              <div className="flex-1 w-full md:w-auto relative flex items-center px-4 py-2 md:py-1">
                <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2 shrink-0">pin_drop</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5" htmlFor="hero-location">
                    Location
                  </label>
                  <input
                    id="hero-location"
                    type="text"
                    value={searchLocation.label}
                    onChange={(e) => setSearchLocation({ district: '', city: '', area: '', label: e.target.value })}
                    placeholder="Try Jutial, Hunza, Skardu..."
                    className="bg-transparent border-0 outline-none p-0 text-sm font-semibold text-slate-900 placeholder:text-slate-400 w-full leading-tight"
                  />
                </div>
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0" />

              {/* Compartment 2: Property Type */}
              <div className="w-full md:w-48 relative flex items-center px-4 py-2 md:py-1">
                <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2 shrink-0">home_work</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5" htmlFor="hero-type">
                    Property Type
                  </label>
                  <select
                    id="hero-type"
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="bg-transparent border-0 outline-none p-0 text-sm font-semibold text-slate-900 cursor-pointer w-full leading-tight"
                  >
                    <option value="any">Any property type</option>
                    <option value="house">House</option>
                    <option value="apartment">Apartment</option>
                    <option value="room">Room</option>
                    <option value="hostel">Hostel</option>
                    <option value="office">Office</option>
                    <option value="commercial">Commercial Space</option>
                  </select>
                </div>
              </div>

              <div className="hidden md:block w-px h-8 bg-slate-200 shrink-0" />

              {/* Compartment 3: Budget */}
              <div className="w-full md:w-44 relative flex items-center px-4 py-2 md:py-1">
                <span className="material-symbols-outlined text-slate-400 text-[20px] mr-2 shrink-0">payments</span>
                <div className="flex flex-col flex-1 min-w-0">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5" htmlFor="hero-budget">
                    Budget
                  </label>
                  <select
                    id="hero-budget"
                    value={searchBudget}
                    onChange={(e) => setSearchBudget(e.target.value)}
                    className="bg-transparent border-0 outline-none p-0 text-sm font-semibold text-slate-900 cursor-pointer w-full leading-tight"
                  >
                    <option value="any">Any budget</option>
                    <option value="under30k">&lt; Rs 30,000</option>
                    <option value="30to60k">Rs 30k – 60k</option>
                    <option value="60to100k">Rs 60k – 100k</option>
                    <option value="100kplus">Rs 100k+</option>
                  </select>
                </div>
              </div>

              {/* Search Trigger */}
              <div className="w-full md:w-auto p-1">
                <button
                  type="submit"
                  className="w-full md:w-auto h-11 px-6 rounded-xl md:rounded-full bg-[#0B1320] text-white hover:bg-[#D97706] transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 font-semibold text-sm cursor-pointer shrink-0"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Popular location pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 pt-3 px-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Popular:</span>
              {POPULAR_SEARCHES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setSearchLocation({ district: city, city, area: '', label: city })}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-medium transition-colors"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Live Regional Metrics Ribbon */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-10 w-full max-w-4xl p-2 sm:p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl">
            <div className="bg-[#141C29]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg hover:border-[#059669]/40 hover:bg-[#141C29] transition-all group">
              <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-[#85F8C4] group-hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">villa</span>
              </div>
              <div className="text-left min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white tracking-tight leading-none">
                    {stats?.totalActive || 26}
                  </span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#85F8C4] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#059669]" />
                  </span>
                </div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">
                  Live Listings
                </p>
              </div>
            </div>

            <div className="bg-[#141C29]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg hover:border-[#059669]/40 hover:bg-[#141C29] transition-all group">
              <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-[#85F8C4] group-hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">map</span>
              </div>
              <div className="text-left min-w-0">
                <span className="text-2xl font-bold text-white tracking-tight leading-none">
                  {stats?.districtsCount || 10}
                </span>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">
                  Districts Listed
                </p>
              </div>
            </div>

            <div className="bg-[#141C29]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg hover:border-[#059669]/40 hover:bg-[#141C29] transition-all group">
              <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-[#85F8C4] group-hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">category</span>
              </div>
              <div className="text-left min-w-0">
                <span className="text-2xl font-bold text-white tracking-tight leading-none">6</span>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">
                  Property Types
                </p>
              </div>
            </div>

            <div className="bg-[#141C29]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex items-center gap-3.5 shadow-lg hover:border-[#059669]/40 hover:bg-[#141C29] transition-all group">
              <div className="rounded-xl bg-white/5 border border-white/10 p-2.5 text-[#85F8C4] group-hover:scale-110 transition-transform flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">verified_user</span>
              </div>
              <div className="text-left min-w-0">
                <span className="text-2xl font-bold text-white tracking-tight leading-none">100%</span>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">
                  Moderated
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. HANDPICKED FOR YOU - FEATURED PROPERTIES                             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D97706]">Handpicked for you</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B1B1D] mt-1 tracking-tight">Featured properties</h2>
            <p className="text-sm text-slate-500 mt-1">Recently verified listings from trusted owners across the region.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Interactive Category Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-200/60 border border-slate-200">
              {['all', 'house', 'apartment', 'hostel', 'office'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeCategory === cat
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>

            <Link
              to="/browse"
              className="inline-flex items-center gap-1 text-sm font-bold text-[#D97706] hover:text-[#904D00] transition-colors group"
            >
              <span>Browse all properties</span>
              <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        {/* Property Grid */}
        {featuredLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProperties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No properties in this category"
            message="Check back soon or explore other property types across Gilgit-Baltistan."
            action={
              <Link to="/browse" className="text-sm font-bold text-[#D97706] hover:underline">
                View all listings
              </Link>
            }
          />
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. BROWSE BY TYPE (3D CURVED BOW / RAINBOW-ARCHED RIBBON CAROUSEL)       */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#F6F3F4] py-20 overflow-hidden relative">
        {/* Ambient atmospheric ribbon glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[260px] bg-[#FE932C]/10 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute top-8 left-1/3 w-72 h-72 bg-[#059669]/10 blur-[90px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D97706]">Browse by type</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B1B1D] mt-1">
              Whatever you are looking for, it starts here
            </h2>
            <p className="text-sm text-slate-500 mt-2">Six property categories, one trusted marketplace.</p>
          </div>

          {/* 3D Arched Bow Track Stage */}
          <div className="relative w-full py-8 overflow-hidden perspective-stage">
            {/* Left & right cinematic depth feathering masks */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#F6F3F4] via-[#F6F3F4]/80 to-transparent z-20" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#F6F3F4] via-[#F6F3F4]/80 to-transparent z-20" />

            {/* Curved floor reflection */}
            <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-12 bg-white/50 blur-2xl rounded-full z-0" />

            {/* 3D Bow-Tilted Animated Ribbon */}
            <div className="bow-track-container w-full">
              <div className="animate-marquee flex items-center gap-6 py-6 px-4">
                {/* 1st Loop of Categories */}
                {TYPE_SHOWCASE.map((item, idx) => (
                  <Link
                    key={`cat-1-${idx}`}
                    to={`/browse?type=${item.type}`}
                    className="bow-card w-56 shrink-0 p-6 rounded-3xl bg-white border border-white/80 hover:border-[#FE932C]/40 group transition-all duration-300 flex flex-col items-center text-center shadow-[0_12px_28px_-6px_rgba(20,28,41,0.08)] hover:shadow-2xl relative overflow-hidden"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0B1320] mb-4 shadow-sm group-hover:scale-110 group-hover:bg-[#0B1320] group-hover:text-white transition-all duration-300">
                      <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                    </div>
                    <span className="text-base font-bold text-[#1B1B1D] group-hover:text-[#D97706] transition-colors">
                      {item.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-[#904D00] text-xs font-bold mt-2">
                      {item.count}
                    </span>
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 flex items-center gap-1 font-medium">
                      {item.desc}
                      <span className="material-symbols-outlined text-[13px] group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </span>
                  </Link>
                ))}

                {/* 2nd Loop for continuous smooth scrolling */}
                {TYPE_SHOWCASE.map((item, idx) => (
                  <Link
                    key={`cat-2-${idx}`}
                    to={`/browse?type=${item.type}`}
                    className="bow-card w-56 shrink-0 p-6 rounded-3xl bg-white border border-white/80 hover:border-[#FE932C]/40 group transition-all duration-300 flex flex-col items-center text-center shadow-[0_12px_28px_-6px_rgba(20,28,41,0.08)] hover:shadow-2xl relative overflow-hidden"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#0B1320] mb-4 shadow-sm group-hover:scale-110 group-hover:bg-[#0B1320] group-hover:text-white transition-all duration-300">
                      <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
                    </div>
                    <span className="text-base font-bold text-[#1B1B1D] group-hover:text-[#D97706] transition-colors">
                      {item.label}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-[#904D00] text-xs font-bold mt-2">
                      {item.count}
                    </span>
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-2 flex items-center gap-1 font-medium">
                      {item.desc}
                      <span className="material-symbols-outlined text-[13px] group-hover:translate-x-0.5 transition-transform">
                        arrow_forward
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EXPLORE THE REGION (POPULAR LOCATIONS)                                  */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold uppercase tracking-widest text-[#D97706] mb-2 shadow-xs">
              <span className="material-symbols-outlined text-[14px]">explore</span>
              <span>Explore the region</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B1B1D] mt-1">Popular locations</h2>
            <p className="text-sm text-slate-500 mt-1">Interactive valley panorama inspired by Northern Pakistan's most sought-after mountain destinations.</p>
          </div>
          <Link
            to="/browse"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#D97706] hover:text-[#904D00] transition-colors group"
          >
            <span>View all 10 districts</span>
            <span className="material-symbols-outlined text-[18px] transform group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </Link>
        </div>

        {/* Skiper 52 Inspired HoverExpand Interactive Accordion */}
        <PopularLocationsExpand stats={stats} />
      </section>

      {/* ========================================================================= */}
      {/* 5. HOW RENTLINK WORKS                                                    */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#0B1320] text-white py-20 relative overflow-hidden">
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#FE932C]/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative">
          <div className="max-w-2xl mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#FFDCC3]">Simple and transparent</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1">
              How <span className="italic font-normal text-[#FE932C]">RentLink</span> works
            </h2>
            <p className="text-sm text-slate-300 mt-2">Four steps between you and the right place: no brokers, no guesswork.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#DBE2F5]">
                    <span className="material-symbols-outlined text-[24px]">search</span>
                  </div>
                  <span className="text-2xl font-bold text-white/20">01</span>
                </div>
                <h3 className="font-bold text-base text-white mb-2">Search smartly</h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  Filter by district, city, property type and budget to shortlist places that actually fit your mountain life.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#85F8C4]">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <span className="text-2xl font-bold text-white/20">02</span>
                </div>
                <h3 className="font-bold text-base text-white mb-2">Verify the details</h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  Every listing shows verified badges, authentic photographs, winter heating amenities and tenant reviews.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#FFDCC3]">
                    <span className="material-symbols-outlined text-[24px]">calendar_month</span>
                  </div>
                  <span className="text-2xl font-bold text-white/20">03</span>
                </div>
                <h3 className="font-bold text-base text-white mb-2">Request a visit</h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  Pick a date and time slot that suits you. The owner confirms and you get reminders and location guidance.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-[#DBE2F5]">
                    <span className="material-symbols-outlined text-[24px]">handshake</span>
                  </div>
                  <span className="text-2xl font-bold text-white/20">04</span>
                </div>
                <h3 className="font-bold text-base text-white mb-2">Move in with confidence</h3>
                <p className="text-xs leading-relaxed text-slate-300">
                  Agree terms directly with verified owners, pay the security deposit and move into your mountain home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WHY RENTLINK (TRUST & MODERATION)                                      */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D97706]">Why RentLink</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1B1B1D] mt-1">
              A marketplace built on <span className="italic font-normal text-[#D97706]">trust</span>
            </h2>
            <p className="text-sm text-slate-600 mt-4 leading-relaxed">
              Renting in the mountains should not feel like a gamble. We built RentLink so every listing, owner and visit carries an authenticated history you can rely on across Gilgit-Baltistan.
            </p>
            <div className="mt-8">
              <Link
                to="/about"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B1320] text-white font-bold text-sm shadow-md hover:bg-[#D97706] transition-all"
              >
                <span>Learn more about us</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-900/5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-[#ECFDF5] flex items-center justify-center text-[#047857] mb-4">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <h3 className="font-bold text-base text-[#1B1B1D] mb-1.5">Verified listings only</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Our moderation team reviews every property and ownership documentation before it goes live, ensuring authenticity.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-900/5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-[#0B1320] mb-4">
                <span className="material-symbols-outlined text-[24px]">badge</span>
              </div>
              <h3 className="font-bold text-base text-[#1B1B1D] mb-1.5">Real people, real profiles</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tenants, owners and agencies have traceable profiles with rental histories and community endorsements.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-900/5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-[#904D00] mb-4">
                <span className="material-symbols-outlined text-[24px]">thermostat</span>
              </div>
              <h3 className="font-bold text-base text-[#1B1B1D] mb-1.5">Built for Gilgit-Baltistan</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                From harsh Hunza winters with heating needs to Skardu summers, our platform data understands regional specifics.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white shadow-sm border border-slate-900/5 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
                <span className="material-symbols-outlined text-[24px]">chat</span>
              </div>
              <h3 className="font-bold text-base text-[#1B1B1D] mb-1.5">Direct communication</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Message owners directly, schedule physical walkthroughs and keep transaction agreements in one organized portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOR OWNERS SECTION                                                    */}
      {/* ========================================================================= */}
      <section className="w-full bg-[#F0EDEE] py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="rounded-3xl bg-white p-8 lg:p-14 shadow-sm border border-slate-900/5 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 flex flex-col">
              <span className="text-xs font-bold uppercase tracking-widest text-[#D97706]">For Owners</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#1B1B1D] mt-1 leading-tight">
                List your place once, reach renters already looking
              </h2>
              <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                Publish through a guided form, keep visit requests and tenant messages in one central dashboard and update details whenever something changes.
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-8">
                <Link
                  to="/owner/properties/new"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#0B1320] text-white font-bold text-sm shadow-md hover:bg-[#D97706] transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add_business</span>
                  <span>List your property</span>
                </Link>
                <Link
                  to="/story"
                  className="inline-flex items-center gap-1.5 font-bold text-sm text-[#1B1B1D] hover:text-[#D97706] transition-colors"
                >
                  <span>How listing works</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col gap-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#0B1320] shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">edit_note</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1B1B1D]">Guided listing form</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Photos, rent rates, seasonal heating amenities and availability collected step-by-step without confusion.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#D97706] shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">rate_review</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1B1B1D]">Reviewed before it goes live</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    A regional moderator verifies property photographs and details so serious renters trust what they see.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#059669] shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[20px]">dashboard</span>
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#1B1B1D]">Everything in one dashboard</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visit requests, tenant inquiries and listing statuses stay together in one secure spot instead of scattered chats.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FINAL CALL TO ACTION CARD                                             */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-6 lg:px-12 py-20 w-full">
        <div className="relative rounded-3xl overflow-hidden bg-[#0B1320] text-white p-8 md:p-16 text-center flex flex-col items-center">
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center mix-blend-overlay opacity-30 pointer-events-none"
            style={{
              backgroundImage:
                'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80")',
            }}
          />

          <div className="relative z-10 max-w-2xl flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md mb-6">
              <span className="material-symbols-outlined text-[16px] text-[#FE932C]">verified</span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white">
                Verified listings across Gilgit-Baltistan
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
              Ready to find your <span className="italic font-normal text-[#FE932C]">next home?</span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 mt-4 max-w-xl">
              Browse verified properties across Gilgit-Baltistan, or list your own and reach renters who are ready to move.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link
                to="/browse"
                className="px-6 py-3.5 rounded-xl bg-white text-[#0B1320] font-bold text-sm shadow-md hover:bg-slate-100 transition-all active:scale-95"
              >
                Browse properties
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 px-6 py-3.5 rounded-xl bg-white/10 border border-white/20 backdrop-blur-md text-white font-bold text-sm hover:bg-white/20 transition-all active:scale-95"
              >
                <span>Learn how it works</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
