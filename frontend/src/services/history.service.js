import { request } from './api.js';
export const historyService = {
  list: (filters = {}, signal) => {
    const params = new URLSearchParams(
      Object.entries(filters).filter(([, value]) => value !== '' && value != null),
    );
    return request(`/api/history?${params}`, { signal });
  },
  stats: (signal) => request('/api/history/stats', { signal }),
  remove: (id) => request(`/api/history/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  clear: () => request('/api/history', { method: 'DELETE' }),
};
