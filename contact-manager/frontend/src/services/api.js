import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message;
    console.error('API Error:', message);
    return Promise.reject(new Error(message));
  }
);

// Create contact API functions
const contactAPI = {
  // Get all contacts with optional filters
  getAll: (params) => api.get('/contacts', { params }),
  
  // Get single contact
  getOne: (id) => api.get(`/contacts/${id}`),
  
  // Create contact
  create: (data) => api.post('/contacts', data),
  
  // Update contact
  update: (id, data) => api.put(`/contacts/${id}`, data),
  
  // Delete contact
  delete: (id) => api.delete(`/contacts/${id}`),
  
  // Toggle favorite
  toggleFavorite: (id) => api.patch(`/contacts/${id}/favorite`),
};

export default contactAPI;