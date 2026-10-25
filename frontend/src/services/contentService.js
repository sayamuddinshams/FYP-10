export const TEAM_MEMBERS = [
  {
    id: 't1',
    name: 'Sayam-ud-Din',
    role: 'Project Lead & Full-Stack Architect',
    bio: 'Leads full-stack architecture, MongoDB native driver data modeling, and end-to-end platform integration. Dedicated to engineering robust, reliable housing solutions for Gilgit-Baltistan.',
    location: 'Gilgit',
  },
  {
    id: 't2',
    name: 'Nouman Azam',
    role: 'Frontend & UI/UX Engineer',
    bio: 'Crafted the editorial Alpine Sanctuary design system, responsive multi-role portal layouts, interactive Leaflet maps, and real-time chat interfaces.',
    location: 'Gilgit',
  },
  {
    id: 't3',
    name: 'Sayad Yaqoob',
    role: 'Backend & Systems Engineer',
    bio: 'Architected the high-throughput REST API pipeline, centralized database connection pooling, and role-based authentication and authorization systems.',
    location: 'Gilgit',
  },
  {
    id: 't4',
    name: 'Irfan Mujeeb',
    role: 'QA & Operations Engineer',
    bio: 'Oversees automated integration test suites, trust and verification moderation workflows, and regional district localization standards across the 10 mountain districts.',
    location: 'Gilgit',
  },
];

export const PARTNERS = [
  { id: 'pa1', name: 'Gilgit-Baltistan Students Union', type: 'Community', detail: 'Campus outreach for verified student accommodation in Gilgit and Skardu.' },
  { id: 'pa2', name: 'Hunza Tourism Association', type: 'Organization', detail: 'Seasonal apartment and guest-house listings for visiting professionals.' },
  { id: 'pa3', name: 'Karakoram Estate Agents Forum', type: 'Partners', detail: 'Shared verification standards for agents operating across GB.' },
  { id: 'pa4', name: 'Women Engineers Pakistan – GB Chapter', type: 'Community', detail: 'Safe housing guidance and reviews from women in the workplace.' },
  { id: 'pa5', name: 'Skardu Chamber of Commerce', type: 'Organization', detail: 'Commercial and office listings for local businesses.' },
  { id: 'pa6', name: 'GB Skills Development Programme', type: 'Partners', detail: 'Accommodation support for trainees placed in other districts.' },
];

/**
 * Static content service: team members and partner organisations.
 */
const contentService = {
  async team() {
    return TEAM_MEMBERS.map((m) => ({ ...m }));
  },

  async partners() {
    return PARTNERS.map((p) => ({ ...p }));
  },

  async story() {
    return { publishedAt: '2026-01-15', author: 'RentLink Team' };
  },
};

export default contentService;
