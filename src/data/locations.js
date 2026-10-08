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

/** All "City, District" combinations — used for popular location cards. */
export const POPULAR_LOCATIONS = [
  { name: 'Gilgit', district: 'Gilgit', listings: 42, image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=70' },
  { name: 'Hunza', district: 'Hunza', listings: 31, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=70' },
  { name: 'Skardu', district: 'Skardu', listings: 27, image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=70' },
  { name: 'Nagar', district: 'Nagar', listings: 12, image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=800&q=70' },
  { name: 'Ghizer', district: 'Ghizer', listings: 15, image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=70' },
  { name: 'Astore', district: 'Astore', listings: 9, image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=70' },
  { name: 'Diamer', district: 'Diamer', listings: 11, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=70' },
  { name: 'Shigar', district: 'Shigar', listings: 8, image: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&w=800&q=70' },
  { name: 'Kharmang', district: 'Kharmang', listings: 7, image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=70' },
  { name: 'Ghanche', district: 'Ghanche', listings: 6, image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=800&q=70' },
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
