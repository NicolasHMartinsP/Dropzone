import { request } from './api.js';
export const downloadService = {
  inspect: (url) => request('/api/downloads/inspect', { method: 'POST', body: { url } }),
  create: (sourceId, format) =>
    request('/api/downloads', { method: 'POST', body: { sourceId, format } }),
};
