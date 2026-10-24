import axios from 'axios';

// Detect API URL based on current hostname
// This allows mobile devices to connect via network IP automatically
const getAPIUrl = () => {
  // If in production build, use relative URLs (same origin)
  if (process.env.NODE_ENV === 'production') {
    return ''; // Empty string means same origin
  }
  
  // In development, detect the current hostname and use it for API
  // This allows mobile devices to connect via network IP
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    const port = '5000'; // Backend port
    
    // If accessing via network IP (not localhost), use network IP for API
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `${protocol}//${hostname}:${port}`;
    }
    
    // If accessing via localhost, check for environment variable or use proxy
    if (process.env.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
    
    // Default to empty (uses proxy for localhost)
    return '';
  }
  
  // Fallback for SSR
  return process.env.REACT_APP_API_URL || '';
};

const API_URL = getAPIUrl();

// Configure axios defaults
if (API_URL) {
  axios.defaults.baseURL = API_URL;
} else if (process.env.NODE_ENV === 'production') {
  // In production, use same origin (relative URLs)
  axios.defaults.baseURL = '';
}

// Add request interceptor to include auth token
axios.interceptors.request.use(
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

// Helper to get full image URL
// Automatically uses the correct hostname (localhost or network IP)
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath;
  
  // In production, use relative URL (same origin)
  if (process.env.NODE_ENV === 'production') {
    return imagePath;
  }
  
  // In development, use full URL with detected hostname
  if (API_URL) {
    return `${API_URL}${imagePath}`;
  }
  
  // Fallback to relative URL (will use proxy in dev for localhost)
  return imagePath;
};

export default axios;
