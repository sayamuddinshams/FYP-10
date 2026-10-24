import { useState } from 'react';
import Icon from '../common/icons';

/**
 * Interactive Google Map component for property locations in Gilgit-Baltistan.
 * Uses Google's zero-dependency embed engine (no API key required).
 */
export default function PropertyMap({ property, className = '' }) {
  // 'm' = Roadmap, 'k' = Satellite, 'p' = Terrain
  const [mapType, setMapType] = useState('m');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!property) return null;

  // Build high-accuracy query string targeting Gilgit-Baltistan localities
  const exactAddress = property.address || `${property.area}, ${property.city}, ${property.district}`;
  const locationQuery = encodeURIComponent(
    `${exactAddress}, Gilgit-Baltistan, Pakistan`
  );

  const embedUrl = `https://maps.google.com/maps?q=${locationQuery}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${locationQuery}`;
  const fullMapUrl = `https://www.google.com/maps/search/?api=1&query=${locationQuery}`;

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(exactAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs ${className}`}>
      {/* Top Map Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-slate-50/70 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
            <Icon name="map" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-bold text-slate-900 sm:text-sm">
              {property.area}, {property.city}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {property.district} District · Gilgit-Baltistan
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Map Layer Switcher */}
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-semibold text-slate-600 shadow-2xs">
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setMapType('m');
              }}
              aria-pressed={mapType === 'm'}
              className={`rounded-md px-2.5 py-1 transition-all ${
                mapType === 'm'
                  ? 'bg-[#0B1320] text-amber-400 shadow-xs'
                  : 'hover:text-slate-950'
              }`}
            >
              Roadmap
            </button>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setMapType('p');
              }}
              aria-pressed={mapType === 'p'}
              className={`rounded-md px-2.5 py-1 transition-all ${
                mapType === 'p'
                  ? 'bg-[#0B1320] text-amber-400 shadow-xs'
                  : 'hover:text-slate-950'
              }`}
            >
              Terrain
            </button>
            <button
              type="button"
              onClick={() => {
                setLoading(true);
                setMapType('k');
              }}
              aria-pressed={mapType === 'k'}
              className={`rounded-md px-2.5 py-1 transition-all ${
                mapType === 'k'
                  ? 'bg-[#0B1320] text-amber-400 shadow-xs'
                  : 'hover:text-slate-950'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Directions Link */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300/80 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-900 transition-colors hover:bg-amber-100 hover:border-amber-400"
          >
            <Icon name="pin" className="h-3.5 w-3.5 text-amber-700" />
            <span className="hidden sm:inline">Get Directions</span>
            <span className="sm:hidden">Directions</span>
            <Icon name="external" className="h-3 w-3 text-amber-700/80" />
          </a>
        </div>
      </div>

      {/* Map Viewport Frame */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full bg-slate-100">
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-50/90 backdrop-blur-xs">
            <span className="h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
            <span className="text-xs font-medium text-slate-600">Loading interactive Google Map…</span>
          </div>
        )}

        <iframe
          key={`${locationQuery}-${mapType}`}
          title={`Google Map for ${property.title}`}
          src={embedUrl}
          className="h-full w-full border-0"
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setLoading(false)}
        />
      </div>

      {/* Address & Quick Actions Footer */}
      <div className="flex flex-col gap-2 border-t border-slate-200/80 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2 min-w-0 text-xs text-slate-600">
          <Icon name="pin" className="h-3.5 w-3.5 shrink-0 text-amber-600" />
          <span className="truncate font-medium text-slate-800" title={exactAddress}>
            {exactAddress}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopyAddress}
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
          >
            {copied ? (
              <>
                <Icon name="check" className="h-3 w-3 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Address Copied!</span>
              </>
            ) : (
              <>
                <Icon name="share" className="h-3 w-3 text-slate-500" />
                <span>Copy Address</span>
              </>
            )}
          </button>

          <a
            href={fullMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900"
          >
            <span>Open in Maps</span>
            <Icon name="external" className="h-3 w-3 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
