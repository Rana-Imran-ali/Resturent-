import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dastarkhwan_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle errors gracefully
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid
      localStorage.removeItem('dastarkhwan_token');
      localStorage.removeItem('dastarkhwan_user');
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  auth: {
    login: async (credentials) => {
      const res = await apiClient.post('/auth/login', credentials);
      return res.data;
    },
    register: async (userData) => {
      const res = await apiClient.post('/auth/register', userData);
      return res.data;
    },
    me: async () => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
    updateProfile: async (data) => {
      const res = await apiClient.put('/auth/profile', data);
      return res.data;
    },
    logout: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (err) {
        console.warn('Logout notification error:', err);
      } finally {
        localStorage.removeItem('dastarkhwan_token');
        localStorage.removeItem('dastarkhwan_user');
      }
    },
  },

  // Menu Management & Recommendations
  menu: {
    getItems: async (params = {}) => {
      const res = await apiClient.get('/menu', { params });
      return res.data;
    },
    getCategories: async () => {
      const res = await apiClient.get('/menu/categories');
      return res.data;
    },
    getItem: async (id) => {
      const res = await apiClient.get(`/menu/${id}`);
      return res.data;
    },
    createItem: async (itemData) => {
      const res = await apiClient.post('/menu', itemData);
      return res.data;
    },
    updateItem: async (id, itemData) => {
      const res = await apiClient.put(`/menu/${id}`, itemData);
      return res.data;
    },
    toggleAvailability: async (id) => {
      const res = await apiClient.patch(`/menu/${id}/toggle-availability`);
      return res.data;
    },
    deleteItem: async (id) => {
      const res = await apiClient.delete(`/menu/${id}`);
      return res.data;
    },
    smartRecommend: async (query) => {
      const res = await apiClient.post('/menu/recommendations', { query });
      return res.data;
    },
  },

  // Orders Management & Live Tracking
  orders: {
    getOrders: async (params = {}) => {
      const res = await apiClient.get('/orders', { params });
      return res.data;
    },
    createOrder: async (orderData) => {
      const res = await apiClient.post('/orders', orderData);
      return res.data;
    },
    getOrder: async (id) => {
      const res = await apiClient.get(`/orders/${id}`);
      return res.data;
    },
    trackOrder: async (orderNumber) => {
      const cleanNum = encodeURIComponent(orderNumber);
      const res = await apiClient.get(`/orders/track/${cleanNum}`);
      return res.data;
    },
    updateStatus: async (id, status) => {
      const res = await apiClient.patch(`/orders/${id}/status`, { status });
      return res.data;
    },
    cancelOrder: async (id, reason = '') => {
      const res = await apiClient.post(`/orders/${id}/cancel`, { reason });
      return res.data;
    },
    getStats: async () => {
      const res = await apiClient.get('/orders/stats/summary');
      return res.data;
    },
  },

  // Customer Management (Admin)
  customers: {
    getCustomers: async (params = {}) => {
      const res = await apiClient.get('/admin/customers', { params });
      return res.data;
    },
    updateRisk: async (id, riskLevel) => {
      const res = await apiClient.patch(`/admin/customers/${id}/risk`, { risk_level: riskLevel });
      return res.data;
    },
  },

  // Vector Database & RAG Assistant
  chat: {
    askRag: async (message, history = []) => {
      const res = await apiClient.post('/chat/rag', { message, history });
      return res.data;
    },
    getRagStatus: async () => {
      const res = await apiClient.get('/rag/status');
      return res.data;
    },
    reindexRag: async () => {
      const res = await apiClient.post('/rag/reindex');
      return res.data;
    },
  },
};

export default api;
