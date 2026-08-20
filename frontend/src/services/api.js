import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token to requests if present
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sentiment_auth_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  async register(name, email, password) {
    const res = await client.post('/auth/register', { name, email, password });
    return res.data;
  },

  async login(email, password) {
    const res = await client.post('/auth/login', { email, password });
    return res.data;
  },

  async getMe() {
    const res = await client.get('/auth/me');
    return res.data;
  },

  // Analysis
  async analyzeText(text, apiKey, model) {
    const res = await client.post('/analyze', { text, apiKey, model });
    return res.data;
  },

  async analyzeFile(file, apiKey, model) {
    const formData = new FormData();
    formData.append('file', file);
    if (apiKey) formData.append('apiKey', apiKey);
    if (model) formData.append('model', model);

    const res = await client.post('/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // Health
  async checkHealth() {
    const res = await client.get('/health');
    return res.data;
  }
};
