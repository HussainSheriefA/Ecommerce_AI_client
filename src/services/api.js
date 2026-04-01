// API URL configuration
// For local dev: uses Django backend on port 8000
// For production: uses Render Django backend
const isLocalhost = window.location.hostname === 'localhost';
const API_URL = isLocalhost ? 'http://localhost:8000/api' : 'https://ecommerce-ai-client-n5gj.onrender.com/api';

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  // Add auth token if available
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    // If it's a network error (backend not available), throw a user-friendly error
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to server. Please try again later.');
    }
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  register: (userData) => apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  login: (credentials) => apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  googleLogin: (token) => apiCall('/auth/google/', {
    method: 'POST',
    body: JSON.stringify({ token })
  }),
  
  getMe: () => apiCall('/auth/me')
};

// Product APIs
export const productAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products?${queryString}`);
  },
  
  getById: (id) => apiCall(`/products/${id}`),
  
  create: (productData) => apiCall('/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  }),
  
  update: (id, productData) => apiCall(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  }),
  
  delete: (id) => apiCall(`/products/${id}`, {
    method: 'DELETE'
  })
};

// Cart APIs
export const cartAPI = {
  getCart: () => apiCall('/cart'),
  
  addItem: (productId, quantity = 1) => apiCall('/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  }),
  
  updateItem: (itemId, quantity) => apiCall(`/cart/items/${itemId}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  }),
  
  removeItem: (itemId) => apiCall(`/cart/items/${itemId}`, {
    method: 'DELETE'
  })
};

// Order APIs
export const orderAPI = {
  create: (orderData) => apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  
  getMyOrders: () => apiCall('/orders'),
  
  getOrderById: (id) => apiCall(`/orders/${id}`)
};

export default apiCall;
