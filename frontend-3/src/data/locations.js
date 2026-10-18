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
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4NgeIeM-_xuKr1Bm9byzdbhrL0GO8XoJ4kM0r8nfN3uGh9GV7eP09qvvAnpg_ydt0NQxvSFgenUNiBdLNHGR61ozzLaj69iq_S53QO1Yg833iAv7tGVEEr5yHC7s5dlCACrhXlwh-8_ZgWl70mmZAU2N7VIAKXWbR_IrhEdJ3Ad8PAtHJp3DU-_R3zhbPdqyPJaHTNUbiYJQQT6XP6BXzzw6b27Pacm-BU-O8bM4xOHCEDuIeN_Ui'
  },
  {
    name: 'Hunza',
    district: 'Hunza',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAy9ydod2w4m0R6eENCW1x093Ju7VKJtfD-Awryc-8CSWfvhYIATyMMV3hTuoEDlmTneLf5Mh81Anxl95dfCz1bHl7I5cpJT9f1SYMLJ2hkk5lTP2EgU31edjE314414FbiIgrzdBOkRUd1tlVGQn0jx7vaA1Tglxp8gqmRDSN2Rz-UcVpZz88lDj5cgxsMjebKNJcaHdkq1lUtuplJtrddIz__fEYBDaZDi2sqJODeu39KO4O3idd5'
  },
  {
    name: 'Skardu',
    district: 'Skardu',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDhQHejAgvffKTppC1OBs56YFRAjkKUT_xjlDvg_hy4tqctr7t76r68iY_o7MN83zcXmcOQvS0_UI59IHaFQEdAKj602AeUIYZI1qV3WjP7uCKDMIHXp0zqLmAXuEzTIdpdaomatIzDBkR00G6KxwDM2kkD-ET8m7JnuwbamR1R0I1vWQ5XIp0X0q0bReYJm2IrinA8168bZrIScbb5WHjOlaU2rMM7orbqO87o-y8N-mSgiok1-EBo'
  },
  {
    name: 'Nagar',
    district: 'Nagar',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUWoksTcM_jqqV7GoUC81poO9nk4u1Sv1DComkJ7RCn25q1lLj8AmpTWWEHKoMC7T66SICA4IbYspuvJRkaKGJAGi1qz6Xhhk19sEl1F4TzLndE6tDuuZjyCnV3_DmxbIOj7JTLH7_mLjhp4GSpkwJ0-skrg9e3h78dy5rrwUWcnXnYMPbCSTtQ9BPccn_bVCkKLKQEvmk5STFPv9CAWW4huUvFAWss7b4EYX6BmJCMaW0Fwu5_bo8'
  },
  {
    name: 'Ghizer',
    district: 'Ghizer',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDywsWpoo50pwZT78qD2q0tU49ZkNEAHA8trv0a75MFgi9MjghNH5DvJ1PA3lMns6-bN41FtTm6OIHeVl4nhez_AT4C9H1feEnG2JK6IDNA_XFbQR9E2KygH1PAJIOeBNu4lHJ_eVVVu1KeyvLq4nMmvGRY0x6OaBWO1Ac9gaixn4yc9gWyY8xnxJLNM5An8Cc0DN7shXahPL1g77R_V8ZDloxq2xsJtdSXngjRmqOxMuoXJEja-KZn'
  },
  {
    name: 'Astore',
    district: 'Astore',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCr7iyaI2_JgFerVUHu2M2Of9YQgdsrQUlFOC4gvA4P11IDW317NTig23qjZw1l0QQ45LyL1ju2hsnKC2UzBb17Hb6PRVPCGW5AS1h6z83BUvKVTFOpso6psoLeBn3Gm2puCTB9tOYauB57U15J66E1xHoyXxQW-7phykhM15vt4TnUTk8CF_GtR9HC3W6vBW4aU4GsgCNNkgmKKgTPgK6P02D1FlBAlKvNnQCI_u42y2GkiaRGDsy1'
  },
  {
    name: 'Diamer',
    district: 'Diamer',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCZ4ya_aitDH55Tin64sG-87RaBF-fmCCTPJATsQIqM0RuaSfH2RzQK5NxRORbciiKHWx_3XAgp8rD6Rv9bJm4B9aRsItNlZzq9nzKKl8dekZYns6lV-dE6ObwgqHera2JmLBE-8aNdwQC9sxgVw4Kq7ethVnMKv9_zfiaO22C_e11ofT7EDFWu9nnD84spex19qDuxxMGXMMxIOfb9RZIa_RLxGQIa3-GDeI5rvXpEPgaIM5VO15CB'
  },
  {
    name: 'Shigar',
    district: 'Shigar',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAapwTooEjqbjCN-DSDLFGDI8h_MZ00eLfhQGlXLjhPgyyIKJhTt8-EhVjBvq_BMBm-utBMa8cn8_lXeLX6P8ZE8FJPZ4cQluegK7qoXKKM4x_lwFMnninsTifh6ZNI2fhYmzl2QgfC6224jkBnskSm3B4naB8b7CDZbq1VIvLk4T9G42Z9v0dpjVRvTUKvIPLGs7FGWCGGq6WGIfTAyHi6AXZcac8RUfqdMYDjAozwVmOEaFJXblrm'
  },
  {
    name: 'Kharmang',
    district: 'Kharmang',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTrXHFVh3JWRdpICtgrcrLcWeBRC5s6v3OBz37VbX_u25hY-NkTTMvdyqRwys4OJPnqHR1D52O_dov0aI1Nj_eVBL9HxytJcl7_P-SVgnNh0gi3AFVQZ0DlHdgHF5VjwOhIqquaCiklj45RCh23lYosXLIE4gs1gJJ2OAkMashocY863gm2HODj6I6x7GMnd5evbpjkivvxnDaGReBiKQeAeLwx7FGdbvTk9hnG2xc8Xm8sKiJRnq-'
  },
  {
    name: 'Ghanche',
    district: 'Ghanche',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuASXnKHbV3qn8byAmEzeY9qNlSL0IGLjc3wwgncJr3bMPPtu1Eviqvox0ZO1mmwz09d_WWX6KXd2YWwFZfvFdBOshoUHMuw5rWMWNjgfxWhv0z4eS5W6CTbaT13CPs3aBHkuurMYSRXH5sCzWKRl0xdTVTB8jZFcfi152XOOQlzKtEA17uqP15boQkG8Dul3WKmur8AVDp1_Fvl98XDdnMOVBsYVrfC3qrl-5Xitzso0lP0IHKJQdql'
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
