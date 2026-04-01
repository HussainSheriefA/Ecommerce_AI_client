// API URL configuration
// For local dev: uses Django backend on port 8000
// For production: uses Render Django backend or Vercel serverless
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocalhost 
  ? 'http://localhost:8000/api' 
  : process.env.REACT_APP_API_URL || 'https://ecommerce-ai-client-n5gj.onrender.com/api';

console.log('🔧 API Configuration:', {
  hostname: window.location.hostname,
  isLocalhost,
  API_URL,
  envVar: process.env.REACT_APP_API_URL
});

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_URL}${endpoint}`;
  
  console.log('📡 API Call:', {
    endpoint,
    fullURL: url,
    method: options.method || 'GET'
  });
  
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
    
    // Check if response is HTML (error page)
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      console.error('Received HTML instead of JSON from:', url);
      throw new Error('Server returned an error page. Please check if the backend is running.');
    }
    
    const data = await response.json();
    
    console.log('📥 API Response:', {
      status: response.status,
      ok: response.ok,
      data: data
    });

    if (!response.ok) {
      // Django REST Framework returns 'detail' for errors
      throw new Error(data.detail || data.message || data.error || JSON.stringify(data));
    }

    return data;
  } catch (error) {
    // If it's a network error (backend not available), throw a user-friendly error
    if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK') {
      console.error('API Connection Error:', {
        url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw new Error('Unable to connect to server. Please check your internet connection and try again.');
    }
    
    // If it's a JSON parse error (HTML received instead of JSON)
    if (error.message.includes('Unexpected token') || error.message.includes('<!DOCTYPE')) {
      console.error('API Response Error:', {
        url,
        error: error.message,
        timestamp: new Date().toISOString()
      });
      throw new Error('Backend server error. Please try again later or contact support.');
    }
    
    throw error;
  }
};

// Auth APIs
export const authAPI = {
  register: (userData) => apiCall('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  login: (credentials) => apiCall('/auth/login/', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  googleLogin: (token) => apiCall('/auth/google/', {
    method: 'POST',
    body: JSON.stringify({ token })
  }),
  
  getMe: () => apiCall('/auth/me/')
};

// Product APIs
export const productAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/products/?${queryString}`);
  },
  
  getById: (id) => apiCall(`/products/${id}/`),
  
  create: (productData) => apiCall('/products/', {
    method: 'POST',
    body: JSON.stringify(productData)
  }),
  
  update: (id, productData) => apiCall(`/products/${id}/`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  }),
  
  delete: (id) => apiCall(`/products/${id}/`, {
    method: 'DELETE'
  })
};

// Cart APIs
export const cartAPI = {
  getCart: () => apiCall('/cart/'),
  
  addItem: (productId, quantity = 1) => apiCall('/cart/items/', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity })
  }),
  
  updateItem: (itemId, quantity) => apiCall(`/cart/items/${itemId}/`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  }),
  
  removeItem: (itemId) => apiCall(`/cart/items/${itemId}/`, {
    method: 'DELETE'
  })
};

// Order APIs
export const orderAPI = {
  create: (orderData) => apiCall('/orders/', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  
  getMyOrders: () => apiCall('/orders/'),
  
  getOrderById: (id) => apiCall(`/orders/${id}/`)
};

export default apiCall;
