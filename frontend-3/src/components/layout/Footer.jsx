import { Link } from 'react-router-dom';
import { useReducedMotion } from '../../hooks/useReducedMotion';

export default function Footer() {
  const prefersReducedMotion = useReducedMotion();

  const scrollToTop = () =>
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

  return (
    <footer aria-label="Site footer" className="w-full bg-[#0B1320] text-slate-300 pt-16 pb-12 border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-16">
          {/* Brand + Regional Focus */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#FE932C] shadow-sm group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">landscape</span>
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">
                rent<span className="text-[#FE932C] font-normal">link</span>
              </span>
            </Link>
            <p className="font-sans text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed mt-1">
              The premier architectural and boutique residential rental network in Gilgit-Baltistan. Verifying stone-and-timber chalets, organic orchard estates, and modern apartments across the Karakorams.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-white text-xs font-medium">
                <span className="material-symbols-outlined text-[#FE932C] text-[16px]">pin_drop</span>
                <span>Hunza • Skardu • Gilgit • Nagar • Ghizer</span>
              </div>
            </div>
          </div>

          {/* Regional Portals */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Regional Portals</span>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link to="/browse?districts=Hunza" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">
                  Hunza & Central Valley
                </Link>
              </li>
              <li>
                <Link to="/browse?districts=Skardu" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">
                  Skardu & Baltistan Plateaus
                </Link>
              </li>
              <li>
                <Link to="/browse?districts=Gilgit" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">
                  Gilgit Capital Estates
                </Link>
              </li>
              <li>
                <Link to="/browse?districts=Nagar" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">
                  Nagar Heritage Chalets
                </Link>
              </li>
              <li>
                <Link to="/browse?districts=Ghizer" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">
                  Ghizer Riverfront Cabins
                </Link>
              </li>
            </ul>
          </div>

          {/* Company & Trust */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Company & Trust</span>
            <ul className="flex flex-col gap-2.5">
              <li>
                <Link to="/about" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">
                  About RentLink
                </Link>
              </li>
              <li>
                <Link to="/story" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">
                  The Mountain Story
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">
                  Curators & Engineers
                </Link>
              </li>
              <li>
                <Link to="/collaborations" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">
                  Partner Foundations
                </Link>
              </li>
              <li>
                <Link to="/advertisements" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors">
                  Showcase Properties
                </Link>
              </li>
            </ul>
          </div>

          {/* Liaison Desk */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-white uppercase tracking-wider">Liaison Desk</span>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                <span className="material-symbols-outlined text-[18px] text-[#FE932C]">location_on</span>
                <span>River Road, Gilgit City, GB</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                <span className="material-symbols-outlined text-[18px] text-[#FE932C]">call</span>
                <a href="tel:+925811459200" className="hover:text-white transition-colors">
                  +92 5811 459 200
                </a>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-xs sm:text-sm">
                <span className="material-symbols-outlined text-[18px] text-[#FE932C]">mail</span>
                <a href="mailto:liaison@rentlink.pk" className="hover:text-white transition-colors">
                  liaison@rentlink.pk
                </a>
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#002114] border border-[#069669]/40 text-[#85F8C4] text-[11px] font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Verified Land Registry
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} RentLink Northern Technologies Ltd. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Security & Escrow
            </Link>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms of Tenancy
            </Link>
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Architecture
            </Link>
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Back to top"
              className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white transition-colors ml-2"
            >
              <span className="material-symbols-outlined text-[18px]">keyboard_arrow_up</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
