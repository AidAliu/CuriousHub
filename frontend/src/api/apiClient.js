import axios from 'axios';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/curioushub/api/v1',
  timeout: 10000, // Add a timeout of 10 seconds to prevent hanging requests
});

// Add a request interceptor to dynamically set the Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle 401 (Unauthorized) errors and refresh the token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If response is 401 Unauthorized and the request is not a retry
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refreshToken')
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available.');

        // Request a new token using the refresh token
        const { data } = await axios.post(
          'http://localhost:8080/curioushub/api/v1/auth/refresh',
          { refreshToken }
        );

        // Save the new tokens and user data in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('role', data.role);

        // Update the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        console.error('Refresh token failed:', refreshError);
        // Clear localStorage and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        alert('Your session has expired. Please log in again.');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
