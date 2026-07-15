import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach Bearer token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        if (refresh_token) {
          localStorage.setItem('refresh_token', refresh_token);
        }

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const auth = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refresh_token: refreshToken }),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
};

// Prescriptions API
export const prescriptions = {
  upload: (formData) =>
    api.post('/prescriptions/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  list: (params = {}) => api.get('/prescriptions', { params }),
  getById: (id) => api.get(`/prescriptions/${id}`),
  reprocess: (id) => api.post(`/prescriptions/${id}/reprocess`),
  verify: (id, data) => api.post(`/prescriptions/${id}/verify`, data),
  delete: (id) => api.delete(`/prescriptions/${id}`),
};

// Medications & Adherence API
export const medications = {
  getSchedule: (date) => api.get('/medications/schedule', { params: { date } }),
  logDose: (data) => api.post('/medications/log', data),
  getAdherence: () => api.get('/medications/adherence'),
};

// Medical History API
export const medicalHistory = {
  list: () => api.get('/medical-history'),
  create: (data) => api.post('/medical-history', data),
  delete: (id) => api.delete(`/medical-history/${id}`),
};

// Reminders API
export const reminders = {
  list: () => api.get('/reminders'),
  toggle: (id, isEnabled) => api.put(`/reminders/${id}`, null, { params: { is_enabled: isEnabled } }),
  trigger: () => api.post('/reminders/trigger'),
};

// AI Assistant API
export const assistant = {
  chat: (data) => api.post('/assistant/chat', data),
};

export default api;

