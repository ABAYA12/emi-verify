import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API Service
export const apiService = {
  // Health check
  health: () => api.get('/health'),

  // Insurance Cases
  insuranceCases: {
    getAll: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/insurance-cases?${params}`);
    },
    getById: (id) => api.get(`/api/insurance-cases/${id}`),
    getForEdit: (id) => api.get(`/api/insurance-cases/${id}/edit`),
    create: (data) => api.post('/api/insurance-cases', data),
    update: (id, data) => api.put(`/api/insurance-cases/${id}`, data),
    delete: (id) => api.delete(`/api/insurance-cases/${id}`),
    bulkCreate: (cases) => api.post('/api/insurance-cases/bulk', { cases }),
  },

  // Document Verifications
  documentVerifications: {
    getAll: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/document-verifications?${params}`);
    },
    getById: (id) => api.get(`/api/document-verifications/${id}`),
    getForEdit: (id) => api.get(`/api/document-verifications/${id}/edit`),
    create: (data) => api.post('/api/document-verifications', data),
    update: (id, data) => api.put(`/api/document-verifications/${id}`, data),
    delete: (id) => api.delete(`/api/document-verifications/${id}`),
    bulkCreate: (verifications) => api.post('/api/document-verifications/bulk', { verifications }),
  },

  // Analytics
  analytics: {
    dashboard: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/analytics/dashboard?${params}`);
    },
    insuranceKPIs: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/analytics/insurance-cases?${params}`);
    },
    documentKPIs: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/analytics/document-verifications?${params}`);
    },
    insuranceCases: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/analytics/insurance-cases?${params}`);
    },
    documentVerifications: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/analytics/document-verifications?${params}`);
    },
    exportReport: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/export/summary?${params}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        },
      });
    },
  },

  // Export
  export: {
    insuranceCases: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/export/insurance-cases?${params}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'text/csv',
        },
      });
    },
    documentVerifications: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/export/document-verifications?${params}`, {
        responseType: 'blob',
        headers: {
          'Accept': 'text/csv',
        },
      });
    },
    summary: (filters = {}) => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      return api.get(`/api/export/summary?${params}`);
    },
  },

  // Authentication
  auth: {
    // New email-based authentication
    signup: (data) => api.post('/api/auth/signup', data),
    verifyEmail: (data) => api.post('/api/auth/verify-email', data),
    resendVerification: (data) => api.post('/api/auth/resend-verification', data),
    login: (data) => api.post('/api/auth/login', data),
    forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
    resetPassword: (data) => api.post('/api/auth/reset-password', data),
    
    // Legacy authentication
    register: (data) => api.post('/api/auth/register', data),
    
    // Common authentication
    refreshToken: (data) => api.post('/api/auth/refresh-token', data),
    logout: () => api.post('/api/auth/logout'),
    getProfile: () => api.get('/api/auth/profile'),
  },
};

export default api;
