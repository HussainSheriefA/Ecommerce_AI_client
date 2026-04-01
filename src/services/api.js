// API URL configuration
// For local dev: uses Django backend on port 8000
// For production: uses Render Django backend or Vercel serverless
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Production backend URL (Render deployment)
const PRODUCTION_API_URL = 'https://ecommerce-ai-client-n5gj.onrender.com/api';

const LOCAL_API_BACKENDS = [
  'http://localhost:8000/api/', // Django
  'http://localhost:5000/api/'  // Node fallback
];

let apiBaseUrl = isLocalhost
  ? (process.env.REACT_APP_API_URL || LOCAL_API_BACKENDS[0])
  : (process.env.REACT_APP_API_URL || PRODUCTION_API_URL);

let API_URL = apiBaseUrl.replace(/\/$/, ''); // Remove trailing slash to avoid double slashes

const setApiBaseUrl = (newBaseUrl) => {
  apiBaseUrl = newBaseUrl;
  API_URL = apiBaseUrl.replace(/\/$/, '');
  console.warn(`🔁 Switched API base URL to: ${API_URL}`);
};

console.log('🔧 API Configuration:', {
  hostname: window.location.hostname,
  isLocalhost,
  apiBaseUrl,
  API_URL,
  envVar: process.env.REACT_APP_API_URL
});

// Health check function
export const checkAPIHealth = async () => {
  // If not localhost, check production backend only
  if (!isLocalhost) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(`${PRODUCTION_API_URL.replace('/api', '')}/`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        return { healthy: true, status: response.status, backend: PRODUCTION_API_URL };
      }
      
      return { healthy: false, status: response.status, error: 'Production backend returned non-OK status' };
    } catch (error) {
      console.error('❌ Production backend health check failed:', error.message);
      return {
        healthy: false,
        error: 'Unable to connect to server. Please ensure the backend is deployed and accessible.'
      };
    }
  }
  
  // Localhost health checks
  const healthChecks = [
    {
      url: 'http://localhost:8000/api/schema/',
      backend: 'http://localhost:8000/api/'
    },
    {
      url: 'http://localhost:5000/api/health',
      backend: 'http://localhost:5000/api/'
    }
  ];

  for (const check of healthChecks) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(check.url, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        if (check.backend !== apiBaseUrl) {
          setApiBaseUrl(check.backend);
        }

        return { healthy: true, status: response.status, backend: check.backend };
      }

      console.warn(`⚠️ Backend health endpoint returned non-OK status for ${check.url}: ${response.status}`);
      continue;
    } catch (error) {
      console.warn(`⚠️ Backend health check failed for ${check.url}:`, error.message);
      // try next URL in list
    }
  }

  return {
    healthy: false,
    error: 'Unable to connect to server. Please ensure the Django backend is running on http://localhost:8000 or Node backend on http://localhost:5000.'
  };
};

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
    
    console.log('📡 Response received:', {
      status: response.status,
      ok: response.ok,
      contentType: response.headers.get('content-type'),
      url: response.url
    });
    
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
    console.error('💥 Request failed:', {
      url,
      error: error.message,
      type: error.name,
      timestamp: new Date().toISOString()
    });

    // If it's a network error (backend not available), attempt fallback
    if (error.message === 'Failed to fetch' || error.code === 'ERR_NETWORK') {
      // Only attempt localhost fallbacks if we're on localhost
      if (isLocalhost) {
        console.warn('Attempting fallback backend for API call...');

        const fallbackBackend = LOCAL_API_BACKENDS.find((b) => b !== apiBaseUrl);
        if (fallbackBackend) {
          setApiBaseUrl(fallbackBackend);
          const fallbackUrl = `${API_URL}${endpoint}`;
          try {
            const fallbackResponse = await fetch(fallbackUrl, config);
            if (!fallbackResponse.ok) {
              const errorData = await fallbackResponse.json().catch(() => null);
              const detail = errorData?.detail || errorData?.message || fallbackResponse.statusText;
              throw new Error(detail || 'Fallback backend request failed');
            }
            return await fallbackResponse.json();
          } catch (fallbackError) {
            console.error('Fallback request also failed:', fallbackError.message);
          }
        }

        throw new Error('Unable to connect to server. Please ensure the Django backend is running on http://localhost:8000 or Node backend on http://localhost:5000');
      } else {
        // On production/Vercel, show production-specific error
        throw new Error(`Unable to connect to server. Backend URL: ${API_URL}. Please check if the backend is deployed and accessible.`);
      }
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
  
  addItem: (productId, quantity = 1) => apiCall('/cart/add/', {
    method: 'POST',
    body: JSON.stringify({ product_id: productId, quantity })
  }),
  
  updateItem: (itemId, quantity) => apiCall(`/cart/update/${itemId}/`, {
    method: 'PUT',
    body: JSON.stringify({ quantity })
  }),
  
  removeItem: (itemId) => apiCall(`/cart/remove/${itemId}/`, {
    method: 'DELETE'
  })
};

// Order APIs
export const orderAPI = {
  create: (orderData) => apiCall('/orders/create/', {
    method: 'POST',
    body: JSON.stringify(orderData)
  }),
  
  getMyOrders: () => apiCall('/orders/'),
  
  getOrderById: (id) => apiCall(`/orders/${id}/`)
};

export default apiCall;
