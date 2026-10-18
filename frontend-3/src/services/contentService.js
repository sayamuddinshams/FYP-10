import { MOCK_TEAM, MOCK_PARTNERS } from '../data/platform';
import { delay } from './core';

/**
 * Static content service: team members and partner organisations.
 * Kept behind the service layer so pages never import mock data directly.
 */
const contentService = {
  async team() {
    await delay(240);
    return MOCK_TEAM.map((m) => ({ ...m }));
  },

  async partners() {
    await delay(240);
    return MOCK_PARTNERS.map((p) => ({ ...p }));
  },

  async story() {
    await delay(200);
    return { publishedAt: '2026-01-15', author: 'RentLink Team' };
  },
};

export default contentService;
