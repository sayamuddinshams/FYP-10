/**
 * Structured location hierarchy for Gilgit-Baltistan.
 * District -> City/Town -> Area/Locality
 * Designed so more districts, cities and areas can be appended later
 * without touching the UI layer.
 */
export const LOCATIONS = {
  Gilgit: {
    label: 'Gilgit',
    cities: {
      Gilgit: ['Jutial', 'Danyore', 'Sultanabad', 'Konodas', 'Kashrote', 'Nomal', 'Naltar', 'Minawar', 'Barmas', 'Sonikot'],
      'Naltar Valley': ['Naltar Bala', 'Naltar Payeen'],
    },
  },
  Hunza: {
    label: 'Hunza',
    cities: {
      Hunza: ['Aliabad', 'Karimabad', 'Altit', 'Ganish', 'Shiskat'],
      'Upper Hunza': ['Gulmit', 'Passu', 'Sost', 'Attabad'],
    },
  },
  Skardu: {
    label: 'Skardu',
    cities: {
      Skardu: ['Skardu City', 'Sadpara', 'Kachura', 'Upper Kachura', 'Lower Kachura', 'Shigari', 'Gamba Skardu'],
    },
  },
  Nagar: {
    label: 'Nagar',
    cities: {
      Nagar: ['Nagar Khas', 'Hopar', 'Nagar Bala', 'Chalt'],
    },
  },
  Ghizer: {
    label: 'Ghizer',
    cities: {
      Ghizer: ['Gahkuch', 'Chitral Chowk', 'Phander', 'Singal', 'Hunjer'],
    },
  },
  Astore: {
    label: 'Astore',
    cities: {
      Astore: ['Chilim', 'Minimarg', 'Rama', 'Rondu', 'Burzil'],
    },
  },
  Diamer: {
    label: 'Diamer',
    cities: {
      Diamer: ['Chilas', 'Sila', 'Thor', 'Jalk', 'Chongra'],
    },
  },
  Shigar: {
    label: 'Shigar',
    cities: {
      Shigar: ['Shigar City', 'Basho', 'Khaplu Valley Road', 'Sadar'],
    },
  },
  Kharmang: {
    label: 'Kharmang',
    cities: {
      Kharmang: ['Skardu Road', 'Saling', 'Manokhar', 'Thallay'],
    },
  },
  Ghanche: {
    label: 'Ghanche',
    cities: {
      Ghanche: ['Kharmang Bala', 'Mashabrum', 'Dawson', 'Soguchi'],
    },
  },
};

export const DISTRICTS = Object.keys(LOCATIONS);

export function getCities(district) {
  return district && LOCATIONS[district] ? Object.keys(LOCATIONS[district].cities) : [];
}

export function getAreas(district, city) {
  if (!district || !LOCATIONS[district]) return [];
  const cities = LOCATIONS[district].cities;
  return cities[city] || [];
}

export function getDistrictLabel(district) {
  return LOCATIONS[district]?.label || district || '';
}

/**
 * Curated "popular location" cards for the homepage and footer.
 * Listing counts are NOT stored here — they are computed from live data
 * (`propertyService.stats().byDistrict`) so the numbers can never drift.
 */
export const POPULAR_LOCATIONS = [
  {
    name: 'Gilgit',
    district: 'Gilgit',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Hunza',
    district: 'Hunza',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Skardu',
    district: 'Skardu',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Nagar',
    district: 'Nagar',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Ghizer',
    district: 'Ghizer',
    image: 'https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Astore',
    district: 'Astore',
    image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Diamer',
    district: 'Diamer',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Shigar',
    district: 'Shigar',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Kharmang',
    district: 'Kharmang',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Ghanche',
    district: 'Ghanche',
    image: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
  },
];

/**
 * Partial location search.
 * "Jut"  -> Jutial, Gilgit
 * "Kari" -> Karimabad, Hunza
 * "Sad"  -> Sadpara, Skardu
 * "Gulm" -> Gulmit, Hunza
 */
export function searchLocations(query, limit = 8) {
  const q = (query || '').trim().toLowerCase();
  const results = [];
  if (!q) return results;

  Object.entries(LOCATIONS).forEach(([district, dNode]) => {
    if (district.toLowerCase().includes(q)) {
      results.push({ district, city: Object.keys(dNode.cities)[0], area: '', label: `${district}`, kind: 'district' });
    }
    Object.entries(dNode.cities).forEach(([city, areas]) => {
      if (city.toLowerCase().includes(q)) {
        results.push({ district, city, area: '', label: `${city}, ${district}`, kind: 'city' });
      }
      areas.forEach((area) => {
        if (area.toLowerCase().includes(q)) {
          results.push({ district, city, area, label: `${area}, ${city}, ${district}`, kind: 'area' });
        }
      });
    });
  });

  const rank = { area: 0, city: 1, district: 2 };
  return results.sort((a, b) => rank[a.kind] - rank[b.kind]).slice(0, limit);
}

/**
 * Centroid coordinates for Gilgit-Baltistan districts for GPS matching and map centering.
 */
export const DISTRICT_COORDINATES = {
  Gilgit: { lat: 35.9208, lng: 74.3144 },
  Hunza: { lat: 36.3167, lng: 74.6500 },
  Skardu: { lat: 35.2971, lng: 75.6333 },
  Nagar: { lat: 36.2500, lng: 74.7000 },
  Ghizer: { lat: 36.1667, lng: 73.7667 },
  Astore: { lat: 35.3667, lng: 74.8500 },
  Diamer: { lat: 35.4167, lng: 74.1000 },
  Shigar: { lat: 35.4244, lng: 75.7275 },
  Kharmang: { lat: 35.1500, lng: 76.1000 },
  Ghanche: { lat: 35.1700, lng: 76.3300 },
};

/**
 * Finds the closest Gilgit-Baltistan district given GPS coordinates.
 */
export function findNearestDistrict(lat, lng) {
  let minDistance = Infinity;
  let closest = 'Gilgit';
  for (const [district, coords] of Object.entries(DISTRICT_COORDINATES)) {
    const dLat = coords.lat - lat;
    const dLng = coords.lng - lng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < minDistance) {
      minDistance = dist;
      closest = district;
    }
  }
  return closest;
}

