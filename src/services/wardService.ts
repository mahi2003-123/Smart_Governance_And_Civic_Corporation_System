import api from './api';
import { Ward } from '../types';

let cachedWards: Ward[] | null = null;
let pendingPromise: Promise<Ward[]> | null = null;

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
        const data: Ward[] = Array.isArray(res.data) ? res.data : [];
        cachedWards = data;
        return data;
      } catch (err) {
        cachedWards = null;
        throw err;
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
