import { request } from './api.js';
export const conversionService = {
  convert(file, format) {
    const body = new FormData();
    body.append('file', file);
    body.append('format', format);
    return request('/api/conversions', { method: 'POST', body });
  },
};
