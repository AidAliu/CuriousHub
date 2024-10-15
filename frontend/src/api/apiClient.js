import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/curioushub/api/v1',
});

// Add a request interceptor to dynamically set the Authorization header
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle 401 (Unauthorized) errors and refresh the token
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If the response status is 401 (Unauthorized) and it's not a retry
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Get the refresh token from localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available.');
        }

        // Request a new access token using the refresh token
        const { data } = await axios.post('http://localhost:8080/curioushub/api/v1/auth/refresh', {
          refreshToken
        });

        // Save the new tokens in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);

        // Update the authorization header for the original request
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

        // Retry the original request with the new token
        return apiClient(originalRequest);
      } catch (refreshError) {
        // If refreshing the token fails, log the user out
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        alert('Your session has expired. Please log in again.');
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
