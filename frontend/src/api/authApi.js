import axios from 'axios';

const API_BASE = '';

const getToken = () => localStorage.getItem('token');

export const authApi = {
  login: (data) => axios.post(`${API_BASE}/auth/login`, data),
  register: (data) => axios.post(`${API_BASE}/auth/register`, data),
};

export const createAuthAxios = () => {
  const instance = axios.create({ baseURL: API_BASE });
  instance.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return instance;
};
