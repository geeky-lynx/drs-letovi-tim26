import axios from 'axios';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 
});


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      
      console.error('API Error:', error.response.status, error.response.data);
    } else if (error.request) {
    
      console.error('Network Error:', error.request);
    } else {
      
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const authHelpers = {
  
  login: async (credentials: { email: string; password: string }) => {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response;
    } catch (error: any) {
      console.error('Login greška:', error.response?.data || error.message);
      throw error;
    }
  },

 
  register: async (userData: any) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error: any) {
      console.error('Register greška:', error.response?.data || error.message);
      throw error;
    }
  },

 
  getProfile: async () => {
    try {
      const response = await apiClient.get('/users/me');
      return response;
    } catch (error: any) {
      console.error('Get profile greška:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response;
    } catch (error: any) {
      console.error('Logout greška:', error.response?.data || error.message);
      
    }
  }
};