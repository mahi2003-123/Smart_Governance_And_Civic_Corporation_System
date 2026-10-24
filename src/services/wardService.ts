import api from './api';
import { Ward } from '../types';

let cachedWards: Ward[] | null = null;
let pendingPromise: Promise<Ward[]> | null = null;

const DEFAULT_WARDS: Ward[] = [
  { id: 'ward_1', wardNumber: 1, name: 'Ward 1 - Central Town', population: 45000, officeAddress: 'Town Hall' },
  { id: 'ward_2', wardNumber: 2, name: 'Ward 2 - North District', population: 38000, officeAddress: 'North Zone Office' },
  { id: 'ward_3', wardNumber: 3, name: 'Ward 3 - South Garden', population: 52000, officeAddress: 'South Zone Office' },
];

export const wardService = {
  getWards: async (forceRefresh = false): Promise<Ward[]> => {
    if (!forceRefresh && cachedWards && cachedWards.length > 0) {
      return cachedWards;
    }
    if (pendingPromise) {
      return pendingPromise;
    }

    pendingPromise = (async () => {
      try {
        const res = await api.get('/wards');
        const data: Ward[] = Array.isArray(res.data) && res.data.length > 0 ? res.data : DEFAULT_WARDS;
        cachedWards = data;
        return data;
      } catch (err) {
        cachedWards = DEFAULT_WARDS;
        return DEFAULT_WARDS;
      } finally {
        pendingPromise = null;
      }
    })();

    return pendingPromise;
  },

  clearCache: () => {
    cachedWards = null;
  }
};
