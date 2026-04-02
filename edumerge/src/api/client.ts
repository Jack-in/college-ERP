import axios from 'axios';

// Base Axios instance configured to point to the new backend
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add global interceptors here for error toast notifications etc if needed
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global 401s, 500s here automatically
    return Promise.reject(error);
  }
);
