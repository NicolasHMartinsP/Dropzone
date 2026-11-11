import { request } from './api.js';

export const authService = {
  register: (data) => request('/api/users', { method: 'POST', body: data }),
  login: (credentials) =>
    request('/api/auth/login', { method: 'POST', body: credentials }),
  logout: () => request('/api/auth/logout', { method: 'POST' }),
  me: (signal) => request('/api/users/me', { signal }),
  updateMe: (changes) => request('/api/users/me', { method: 'PATCH', body: changes }),
  deleteMe: () => request('/api/users/me', { method: 'DELETE' }),
};
