import { useState, useMemo } from 'react';
import { Select } from '../common/Input';
import Input from '../common/Input';
import Button from '../common/Button';
import Icon from '../common/icons';
import { DISTRICTS, getCities, getAreas, findNearestDistrict } from '../../data/locations';

/**
 * Reusable LocationPicker with GPS Auto-Detection & Live Google Map Preview.
 * Used in AddProperty and EditProperty.
 */
export default function LocationPicker({ form, update, errors = {}, className = '' }) {
  const [detecting, setDetecting] = useState(false);
  const [statusNotice, setStatusNotice] = useState(null);
  const [mapType, setMapType] = useState('m'); // 'm' = Roadmap, 'p' = Terrain, 'k' = Satellite
  const [mapLoading, setMapLoading] = useState(false);

  const cities = useMemo(() => getCities(form.district), [form.district]);
  const areas = useMemo(() => getAreas(form.district, form.city), [form.district, form.city]);

  // Build the live location query for Google Maps
  const locationQueryParts = [
    form.address?.trim(),
    form.area?.trim(),
    form.city?.trim(),
    form.district?.trim(),
    'Gilgit-Baltistan',
    'Pakistan',
  ].filter(Boolean);

  const hasSelectedLocation = Boolean(form.district);
  const locationQuery = locationQueryParts.join(', ');
  const embedUrl = hasSelectedLocation
    ? `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&t=${mapType}&z=15&ie=UTF8&iwloc=&output=embed`
    : null;
  const externalMapUrl = hasSelectedLocation
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`
    : null;

  /**
   * Triggers the native browser geolocation permission prompt.
   */
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setStatusNotice({
        type: 'error',
        title: 'Geolocation not supported',
        message: 'Your browser does not support GPS location detection. Please select your district and city manually.',
      });
      return;
    }

    setDetecting(true);
    setStatusNotice(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let matchedDistrict = findNearestDistrict(latitude, longitude);
        let matchedCity = '';
        let matchedArea = '';
        let matchedRoad = '';

        // Attempt reverse geocoding via OpenStreetMap with a 3s timeout
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 3000);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { signal: controller.signal }
          );
          clearTimeout(timer);

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};

            // Look for matching district name in reverse geocode
            const possibleDistrict = [addr.state_district, addr.county, addr.state, addr.city]
              .filter(Boolean)
              .find((name) =>
                DISTRICTS.some((d) => d.toLowerCase() === name.toLowerCase())
              );
            if (possibleDistrict) {
              matchedDistrict = DISTRICTS.find((d) => d.toLowerCase() === possibleDistrict.toLowerCase());
            }

            const availCities = getCities(matchedDistrict);
            const foundCity = availCities.find(
              (c) =>
                c.toLowerCase() === (addr.city || addr.town || addr.village || '').toLowerCase()
            );
            if (foundCity) {
              matchedCity = foundCity;
              const availAreas = getAreas(matchedDistrict, matchedCity);
              const foundArea = availAreas.find(
                (a) =>
                  a.toLowerCase() === (addr.suburb || addr.neighbourhood || addr.quarter || '').toLowerCase()
              );
              if (foundArea) matchedArea = foundArea;
            }

            if (addr.road) {
              matchedRoad = addr.road;
            }
          }
        } catch {
          // Fallback to geometric centroid match
        }

        // Apply updates
        update('district', matchedDistrict);

        const availableCities = getCities(matchedDistrict);
        const nextCity = matchedCity || availableCities[0] || '';
        update('city', nextCity);

        const availableAreas = getAreas(matchedDistrict, nextCity);
        const nextArea = matchedArea || availableAreas[0] || '';
        update('area', nextArea);

        if (matchedRoad && !form.address) {
          update('address', `Near ${matchedRoad}`);
        }

        setDetecting(false);
        setMapLoading(true);
        setStatusNotice({
          type: 'success',
          title: 'Location Detected Successfully!',
          message: `GPS coordinates (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E) matched to ${matchedDistrict}${
            nextCity ? ` · ${nextCity}` : ''
          }. Please verify your street address and the live map below.`,
        });
      },
      (err) => {
        setDetecting(false);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setStatusNotice({
            type: 'warning',
            title: 'Location Permission Denied',
            message:
              'You or your browser declined the location request. No problem — you can choose your District, City, and Area using the dropdowns below.',
          });
        } else if (err.code === 2) {
          // POSITION_UNAVAILABLE
          setStatusNotice({
            type: 'error',
            title: 'Position Unavailable',
            message: 'Unable to detect your GPS position. Please pick your location from the lists below.',
          });
        } else {
          // TIMEOUT / OTHER
          setStatusNotice({
            type: 'error',
            title: 'Location Timeout',
            message: 'Location detection took too long. Please pick your location from the dropdowns below.',
          });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  };

  return (
    <div className={`space-y-5 ${className}`}>
      {/* Location Auto-Detection Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 p-4 shadow-xs sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-xs">
              <Icon name="pin" className="h-5 w-5" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                Auto-Detect Property Location
              </h3>
              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                Click the button to prompt your browser to turn on GPS location and instantly set your valley & district.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="primary"
            onClick={handleDetectLocation}
            disabled={detecting}
            className="shrink-0 rounded-xl bg-[#0B1320] text-amber-400 hover:bg-[#141C29] transition shadow-xs"
          >
            {detecting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                <span>Detecting GPS…</span>
              </>
            ) : (
              <>
                <Icon name="pin" className="h-4 w-4" />
                <span>Use Current Location</span>
              </>
            )}
          </Button>
        </div>

        {/* Status Notice (Success, Denied, Error) */}
        {statusNotice && (
          <div
            role="alert"
            className={`mt-4 flex items-start justify-between gap-3 rounded-xl border p-3.5 text-xs animate-fade-up ${
              statusNotice.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : statusNotice.type === 'warning'
                ? 'border-amber-200 bg-amber-50 text-amber-900'
                : 'border-red-200 bg-red-50 text-red-900'
            }`}
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <Icon
                name={statusNotice.type === 'success' ? 'check' : 'alert'}
                className={`mt-0.5 h-4 w-4 shrink-0 ${
                  statusNotice.type === 'success'
                    ? 'text-emerald-600'
                    : statusNotice.type === 'warning'
                    ? 'text-amber-600'
                    : 'text-red-600'
                }`}
              />
              <div>
                <p className="font-bold">{statusNotice.title}</p>
                <p className="mt-0.5 leading-relaxed text-slate-600">{statusNotice.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStatusNotice(null)}
              aria-label="Dismiss message"
              className="rounded-md p-1 text-slate-400 transition hover:bg-slate-200/50 hover:text-slate-700"
            >
              <Icon name="x" className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Manual Dropdowns & Address Input */}
      <div className="grid gap-5 sm:grid-cols-3">
        <Select
          label="District"
          required
          placeholder="Select district"
          value={form.district}
          onChange={(e) => {
            const nextDistrict = e.target.value;
            update('district', nextDistrict);
            const nextCities = getCities(nextDistrict);
            update('city', nextCities[0] || '');
            const nextAreas = getAreas(nextDistrict, nextCities[0]);
            update('area', nextAreas[0] || '');
            setMapLoading(true);
          }}
          error={errors.district}
        >
          {DISTRICTS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </Select>

        <Select
          label="City / Town"
          required
          placeholder={form.district ? 'Select city' : 'Select district first'}
          value={form.city}
          onChange={(e) => {
            const nextCity = e.target.value;
            update('city', nextCity);
            const nextAreas = getAreas(form.district, nextCity);
            update('area', nextAreas[0] || '');
            setMapLoading(true);
          }}
          error={errors.city}
          disabled={!form.district}
        >
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Select
          label="Area / Locality"
          required
          placeholder={form.city ? 'Select area' : 'Select city first'}
          value={form.area}
          onChange={(e) => {
            update('area', e.target.value);
            setMapLoading(true);
          }}
          error={errors.area}
          disabled={!form.city}
        >
          {areas.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </Select>
      </div>

      <Input
        label="Street address & nearby landmarks"
        required
        placeholder="e.g. House 24-B, University Road, near Jutial Bazaar"
        value={form.address}
        onChange={(e) => {
          update('address', e.target.value);
          setMapLoading(true);
        }}
        error={errors.address}
        hint="Be as specific as possible: road name, lane number, and prominent landmarks help Google Maps place an accurate pin."
      />

      {/* Live Google Map Preview Box */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        {/* Map Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/80 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700">
              <Icon name="map" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900 sm:text-sm">
                Live Google Map Preview
              </p>
              <p className="text-[11px] text-slate-500">
                {hasSelectedLocation
                  ? `${form.area ? `${form.area}, ` : ''}${form.city ? `${form.city}, ` : ''}${form.district}`
                  : 'Select a location above to preview the map pin'}
              </p>
            </div>
          </div>

          {hasSelectedLocation && (
            <div className="flex items-center gap-2">
              {/* Layer switchers */}
              <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5 text-[11px] font-semibold text-slate-600 shadow-2xs">
                <button
                  type="button"
                  onClick={() => {
                    setMapLoading(true);
                    setMapType('m');
                  }}
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
                    setMapLoading(true);
                    setMapType('p');
                  }}
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
                    setMapLoading(true);
                    setMapType('k');
                  }}
                  className={`rounded-md px-2.5 py-1 transition-all ${
                    mapType === 'k'
                      ? 'bg-[#0B1320] text-amber-400 shadow-xs'
                      : 'hover:text-slate-950'
                  }`}
                >
                  Satellite
                </button>
              </div>

              {externalMapUrl && (
                <a
                  href={externalMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
                >
                  <span>Open</span>
                  <Icon name="external" className="h-3 w-3 text-slate-400" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Map Body */}
        {hasSelectedLocation ? (
          <div className="relative h-64 sm:h-80 w-full bg-slate-100">
            {mapLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-50/90 backdrop-blur-xs">
                <span className="h-6 w-6 animate-spin rounded-full border-2 border-amber-600 border-t-transparent" />
                <span className="text-xs font-medium text-slate-600">Updating Google Map pin…</span>
              </div>
            )}
            <iframe
              key={`${locationQuery}-${mapType}`}
              title="Google Map Preview"
              src={embedUrl}
              className="h-full w-full border-0"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              onLoad={() => setMapLoading(false)}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2.5 px-4 py-12 text-center bg-slate-50/50">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Icon name="pin" className="h-6 w-6" />
            </span>
            <p className="text-sm font-semibold text-slate-700">No Location Selected Yet</p>
            <p className="max-w-md text-xs text-slate-500 leading-relaxed">
              Choose your District and City above or click <strong>Use Current Location</strong>.
              Your interactive Google Map preview will appear here immediately so you can inspect your property’s position and satellite view.
            </p>
          </div>
        )}

        {/* Map Footer Information */}
        {hasSelectedLocation && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 min-w-0">
              <Icon name="check" className="h-3.5 w-3.5 text-emerald-600 shrink-0" strokeWidth={2.5} />
              <span className="truncate">
                Tenants will see this exact map view when viewing your published listing.
              </span>
            </div>
            <span className="hidden sm:inline-block shrink-0 text-[11px] text-slate-400">
              Google Maps Universal Embed
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
